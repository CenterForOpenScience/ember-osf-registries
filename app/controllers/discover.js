import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';
import config from 'ember-get-config';

import Analytics from 'ember-osf/mixins/analytics';
import { transformShareData, buildLockedQueryBody, constructBasicFilters, buildQueryBody } from 'ember-osf/utils/discover-page';


const DEBOUNCE_MS = 250;

const filterQueryParams = {
    provider: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return value.join('OR');
        },
        deserialize(value) {
            return value.split('OR');
        },
    },
    type: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return value.join('OR');
        },
        deserialize(value) {
            return value.split('OR');
        },
    },
};

export const discoverQueryParams = new QueryParams(
    filterQueryParams,
    {
        q: {
            defaultValue: '',
            refresh: true,
            replace: true,
        },
        size: {
            defaultValue: 10,
            refresh: true,
        },
        sort: {
            defaultValue: '',
            refresh: true,
        },
        page: {
            defaultValue: 1,
            refresh: true,
        },
    },
);

/**
 * @module ember-osf-registries
 * @submodule controllers
 */

/**
 * @class Discover Controller
 *
 * Most of the discover page is built using the discover-page component in ember-osf.
 * The component is largely based on SHARE's discover interface:
 * https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
 * and the existing preprints/registries interfaces
 */
export default Controller.extend(Analytics, discoverQueryParams.Mixin, {
    i18n: service(),
    theme: service(),
    currentUser: service(),
    metrics: service(),

    consumingService: 'registries',
    searchPlaceholder: 'discover.search.placeholder',
    showActiveFilters: true, // should always have a provider

    filterMap: { // Map active filters to facet names expected by SHARE
        provider: 'sources',
        type: 'registration_type',
    },

    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Registries',
        'Research Papers in Economics': 'RePEc',
    },

    lockedParams: { types: ['registration'] }, // Parameter names which cannot be changed

    queryParamsChanged: computed.or('queryParamsState.{page,sort,q,type,provider}.changed'),

    whiteListedProviders: [
        'OSF',
        'ClinicalTrials.gov',
        'Research Registry',
    ].map(item => item.toLowerCase()),

    facets: computed('i18n.locale', function() { // List of facets available for registries
        return [
            {
                key: 'provider',
                title: `${this.get('i18n').t('discover.main.providers')}`,
                component: 'search-facet-provider',
            },
            {
                key: 'type',
                title: `${this.get('i18n').t('discover.main.type')}`,
                component: 'search-facet-registration-type',
            },
        ];
    }),

    sortOptions: computed('i18n.locale', function() { // Sort options for registries
        const i18n = this.get('i18n');
        return [{
            display: i18n.t('discover.relevance'),
            sortBy: '',
        }, {
            display: i18n.t('discover.sort_oldest_newest'),
            sortBy: 'date_updated',
        }, {
            display: i18n.t('discover.sort_newest_oldest'),
            sortBy: '-date_updated',
        }];
    }),

    searchUrl: computed('currentUser.sessionKey', function() {
        // Pulls SHARE search url from config file.
        const preference = this.get('currentUser.sessionKey');
        return `${config.OSF.shareSearchUrl}?preference=${preference}`;
    }),

    actions: {
        clearFilters() {
            this.resetQueryParams(Object.keys(filterQueryParams));
        },
        search() {
            this.get('fetchData').perform(this.get('allQueryParams'));
        },
    },

    setup({ queryParams }) {
        this.get('fetchData').perform(queryParams);
    },

    queryParamsDidChange({ shouldRefresh, queryParams, changed }) {
        if (queryParams.page !== 1 && !changed.page) {
            this.set('page', 1);
        }

        if (changed.provider) {
            // can only filter by type if OSF Regsitries is the only provider selected
            if (queryParams.provider.length !== 1 || !queryParams.provider.includes('OSF')) {
                this.resetQueryParams(['type']);
            }
        }

        if (changed.q) {
            this.get('trackDebouncedSearch').perform();
        }

        if (shouldRefresh) {
            this.get('fetchData').perform(queryParams);
        }
    },

    reset(isExiting) {
        if (isExiting) {
            this.resetQueryParams();
        }
    },

    trackDebouncedSearch: task(function* () {
        yield timeout(DEBOUNCE_MS);
        this.get('metrics').trackEvent({
            category: 'input',
            action: 'onkeyup',
            label: 'Discover - Search',
            extra: this.get('q'),
        });
    }).restartable(),

    getQueryBody(queryParams) {
        /**
         * Builds query body to send to SHARE from a combination of
         * locked Params, facetFilters and activeFilters
         *
         * @method getQueryBody
         * @return queryBody
         */
        const lockedFilters = buildLockedQueryBody(this.get('lockedParams')); // Empty list if no locked query parameters
        const filters = constructBasicFilters(
            this.get('filterMap'),
            lockedFilters,
            this.get('theme.isProvider'),
            queryParams,
        );

        return buildQueryBody(queryParams, filters, this.get('queryParamsChanged'));
    },

    fetchData: task(function* (queryParams) {
        yield timeout(DEBOUNCE_MS);
        const queryBody = this.getQueryBody(queryParams);

        try {
            const response = yield $.ajax({
                url: this.get('searchUrl'),
                crossDomain: true,
                type: 'POST',
                contentType: 'application/json',
                data: queryBody,
            });

            const results = response.hits.hits.map((hit) => {
                // Make share data look like apiv2 preprints data
                return transformShareData(hit);
            });

            if (response.aggregations) {
                this.set('aggregations', response.aggregations);
            }

            this.setProperties({
                numberOfResults: response.hits.total,
                results,
                queryError: false,
            });
        } catch (errorResponse) {
            this.setProperties({
                numberOfResults: 0,
                results: [],
            });

            if (errorResponse.status === 400) {
                this.set('queryError', true);
            } else {
                this.send('elasticDown');
            }
        }
    }).restartable(),
});
