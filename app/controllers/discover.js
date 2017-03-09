import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';
import RegistrationCount from '../mixins/registration-count';

import { elasticEscape } from '../utils/elastic-query';

var getProvidersPayload = '{"from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"types": "registration"}}]}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

const filterMap = {
    providers: 'sources',
    types: 'registration_type'
};

export default Ember.Controller.extend(Analytics, RegistrationCount, {
    theme: Ember.inject.service(), // jshint ignore:line
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: {
        page: 'page',
        queryString: 'q',
        typeFilter: 'type',
        providerFilter: 'provider',
    },

    activeFilters: { providers: [], types: [] },

    osfProviders: [
        'OSF',
        // 'AEA Registry', //These need to be added to the language filter once on SHARE (OSF -> OSF Registries)
        // 'ANZCTR',
        // 'Clinicaltrials.gov',
        // 'EGAP',
        // 'EU Clinical Trials',
        // 'ISRCTN',
        // 'Research Registry',
        // 'RIDIE'
    ],

    registrationTypes: [
        'AsPredicted Preregistration',
        'Election Research Preacceptance Competition',
        'Open-Ended Registration',
        'OSF-Standard Pre-Data Collection Registration',
        'Prereg Challenge',
        'Pre-Registration in Social Psychology (van \'t Veer & Giner-Sorolla, 2016): Pre-Registration',
        'Replication Recipe (Brandt et al., 2013): Post-Completion',
        'Replication Recipe (Brandt et al., 2013): Pre-Registration',
    ],

    page: 1,
    size: 10,
    numberOfResults: 0,
    queryString: '',
    queryBody: {},
    providersPassed: false,

    staticSortOptions: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],
    sortByOptions: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],

    // chosenOption is always the first element in the list
    chosenSortByOption: Ember.computed('sortByOptions', function() {
        return this.get('sortByOptions')[0];
    }),

    showActiveFilters: true, //should always have a provider, don't want to mix osfProviders and non-osf
    showPrev: Ember.computed.gt('page', 1),
    showNext: Ember.computed('page', 'size', 'numberOfResults', function() {
        return this.get('page') * this.get('size') < this.get('numberOfResults');
    }),

    results: Ember.ArrayProxy.create({ content: [] }),

    searchUrl: config.SHARE.searchUrl,

    init() {
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());

        Ember.$.ajax({
            type: 'POST',
            url: this.get('searchUrl'),
            data: getProvidersPayload,
            contentType: 'application/json',
            crossDomain: true,
        }).then(results => {
            const hits = results.aggregations.sources.buckets;
            const providers = hits;

            providers.push(
                ...this.get('osfProviders')
                .filter(key => !providers
                    .find(hit => hit.key.toLowerCase() === key.toLowerCase())
                )
                .map(key => ({
                    key,
                    doc_count: 0
                }))
            );

            providers
                .sort((a, b) => a.key.toLowerCase() < b.key.toLowerCase() ? -1 : 1)
                .unshift(
                    ...providers.splice(
                        providers.findIndex(item => item.key === 'OSF'),
                        1
                    )
                );

            if (!this.get('theme.isProvider')) {
                this.set('otherProviders', providers);
            } else {
                const filtered = providers.filter(
                    item => item.key.toLowerCase() === this.get('theme.id').toLowerCase()
                );

                this.set('otherProviders', filtered);
                this.get('activeFilters.providers').pushObject(filtered[0].key);
            }

            this.notifyPropertyChange('otherProviders');
        });
        this.loadPage();
        Ember.run.schedule('afterRender', () => {
            let providers = this.get('activeFilters.providers');
            if (providers.length === 1 && providers[0] === 'OSF') {
                return;
            }
            this.toggleTypeCSS(false);
        });
    },
    registrationTypeCache: null,
    setVisibilityOfOSFFilters: Ember.observer('providerFilter', function() {
        if (this.get('providerFilter') === 'OSF') {
            if (this.get('registrationTypeCache')) {
                this.set('typeFilter', this.get('registrationTypeCache'));
                this.set('registrationTypeCache', null);
            }
            this.toggleTypeCSS(true);
        } else {
            if (this.get('typeFilter')) {
                this.set('registrationTypeCache', this.get('typeFilter'));
                this.set('typeFilter', '');
                this.set('activeFilters.types', []);
                this.notifyPropertyChange('activeFilters');
                this.loadPage();
            }
            this.toggleTypeCSS(false);
        }
    }),
    toggleTypeCSS(show) {
        if (show) {
            Ember.$('.type-selector-warning').hide();
            Ember.$('.type-checkbox').removeAttr('disabled');
            Ember.$('.registration-type-selector').fadeTo('slow', 1);
        } else {
            Ember.$('.type-selector-warning').show();
            Ember.$('.type-checkbox').attr('disabled', 'disabled');
            Ember.$('.registration-type-selector').fadeTo('slow', 0.5);
        }
    },
    typeChanged: Ember.observer('typeFilter', function() {
        Ember.run.once(() => {
            let filter = this.get('typeFilter');
            if (!filter || filter === 'true') return;
            this.set('activeFilters.types', filter.split('AND'));
            this.notifyPropertyChange('activeFilters');
            this.loadPage();
        });
    }),
    providerChanged: Ember.observer('providerFilter', function() {
        if (!this.get('theme.isProvider')) {
            Ember.run.once(() => {
                let filter = this.get('providerFilter');
                if (!filter || filter === 'true') return;
                this.set('activeFilters.providers', filter.split('AND'));
                this.notifyPropertyChange('activeFilters');
                this.set('providersPassed', true);
                this.loadPage();
            });
        }
    }),
    loadPage() {
        this.set('loading', true);
        Ember.run.debounce(this, this._loadPage, 500);
    },
    _loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());

        return Ember.$.ajax({
            url: this.get('searchUrl'),
            crossDomain: true,
            type: 'POST',
            contentType: 'application/json',
            data: queryBody
        }).then(json => {
            if (this.isDestroyed || this.isDestroying) return;

            this.set('numberOfResults', json.hits.total);

            let results = json.hits.hits.map(hit => {
                // HACK: Make share data look like apiv2 preprints data
                let result = Ember.merge(hit._source, {
                    id: hit._id,
                    type: 'elastic-search-result',
                    workType: hit._source['@type'],
                    providers: hit._source.sources.map(item => ({name: item})),
                    osfProvider: hit._source.sources.reduce((acc, source) => (acc || this.get('osfProviders').includes(source)), false),
                    hyperLinks: [// Links that are hyperlinks from hit._source.lists.links
                        {
                            type: 'share',
                            url: config.SHARE.baseUrl + 'preprint/' + hit._id
                        }
                    ],
                    infoLinks: [], // Links that are not hyperlinks  hit._source.lists.links
                    registrationType: hit._source.registration_type
                });

                hit._source.identifiers.forEach(function(identifier) {
                    if (identifier.startsWith('http://')) {
                        result.hyperLinks.push({url: identifier});
                    } else {
                        const spl = identifier.split('://');
                        const [type, uri, ..._] = spl; // jshint ignore:line
                        result.infoLinks.push({type, uri});
                    }
                });

                result.contributors = result.lists.contributors ? result.lists.contributors
                  .sort((b, a) => (b.order_cited || -1) - (a.order_cited || -1))
                  .map(contributor => ({
                        users: Object.keys(contributor)
                          .reduce(
                              (acc, key) => Ember.merge(acc, {[key.camelize()]: contributor[key]}),
                              {bibliographic: contributor.relation !== 'contributor'}
                          )
                    })) : [];

                // Temporary fix to handle half way migrated SHARE ES
                // Only false will result in a false here.
                result.contributors.map(contributor => contributor.users.bibliographic = !(contributor.users.bibliographic === false));  // jshint ignore:line

                return result;
            });

            this.set('loading', false);
            return this.set('results', results);
        });
    },
    maxPages: Ember.computed('numberOfResults', function() {
        return ((this.get('numberOfResults') / this.get('size')) | 0) + (this.get('numberOfResults') % 10 === 0 ? 0 : 1);
    }),
    getQueryBody() {
        const facetFilters = this.get('activeFilters');

        this.set('typeFilter', facetFilters.types.join('AND'));

        if (!this.get('theme.isProvider'))
            this.set('providerFilter', facetFilters.providers.join('AND'));

        const filter = [
            {
                terms: {
                    type: [
                        'registration'
                    ]
                }
            }
        ];

        // TODO set up ember to transpile Object.entries
        for (const key in filterMap) {
            const val = filterMap[key];
            const filterList = facetFilters[key];

            if (!filterList.length || (key === 'providers' && this.get('theme.isProvider')))
                continue;

            filter.push({
                terms: {
                    [val]: filterList
                }
            });
        }

        if (this.get('theme.isProvider')) {
            filter.push({
                terms: {
                    sources: [this.get('theme.provider.name')]
                }
            });
        }

        const sortByOption = this.get('chosenSortByOption');
        const sort = {};

        if (sortByOption === 'Upload date (oldest to newest)') {
            sort.date_published = 'asc';
        } else if (sortByOption === 'Upload date (newest to oldest)') {
            sort.date_published = 'desc';
        }

        return this.set('queryBody', {
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: elasticEscape(this.get('queryString')) || '*'
                        }
                    },
                    filter
                }
            },
            sort,
            from: (this.get('page') - 1) * this.get('size'),
        });
    },

    reloadSearch: Ember.observer('activeFilters', function() {
        this.set('page', 1);
        this.loadPage();
    }),
    otherProviders: [],
    actions: {
        search(val, event) {
            if (event &&
                (
                    event.keyCode < 49 ||
                    [91, 92, 93].includes(event.keyCode)
                ) &&
                ![8, 32, 48].includes(event.keyCode)
            )
                return;

            this.set('page', 1);
            this.loadPage();

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: `${event && event.type === 'keyup' ? 'input' : 'button'}`,
                    action: `${event && event.type === 'keyup' ? 'onkeyup' : 'click'}`,
                    label: 'Registries -  Discover - Search'
                });
        },

        previous() {
            if (this.get('page') > 1) {
                this.decrementProperty('page');
                this.loadPage();
            }
        },

        next() {
            if (this.get('page') * this.get('size') <= this.get('numberOfResults')) {
                this.incrementProperty('page');
                this.loadPage();
            }
        },

        clearFilters() {
            this.set('activeFilters', {
                providers: this.get('theme.isProvider') ? this.get('activeFilters.providers') : [],
                types: []
            });

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Registries -  Discover - Clear Filters'
                });
        },

        sortBySelect(index) {
            // Selecting an option just swaps it with whichever option is first
            let copy = this.get('staticSortOptions').slice(0);
            let temp = copy[0];
            copy[0] = copy[index];
            copy[index] = temp;
            this.set('sortByOptions', copy);
            this.set('page', 1);
            this.loadPage();

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: `Registries -  Discover - Sort by: ${this.get('staticSortOptions')[index]}`
                });
        },

        updateFilters(filterType, item) {
            item = typeof item === 'object' ? item.text : item;
            const filters = this.get(`activeFilters.${filterType}`);
            const hasItem = filters.includes(item);
            const action = hasItem ? 'remove' : 'push';
            filters[`${action}Object`](item);
            this.notifyPropertyChange('activeFilters');

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'filter',
                    action: hasItem ? 'remove' : 'add',
                    label: `Registries -  Discover - ${filterType} ${item}`
                });
        },
    },
});
