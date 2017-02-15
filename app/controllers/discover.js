import Ember from 'ember';
import config from 'ember-get-config';
import KeenAndGoogleAnalytics from '../mixins/keen-and-google-analytics';
import RegistrationCount from '../mixins/registration-count';

import { elasticEscape } from '../utils/elastic-query';

var getProvidersPayload = '{"from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"types": "registration"}}]}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

const filterMap = {
    providers: 'sources',
    types: 'registration_type'
};

export default Ember.Controller.extend(KeenAndGoogleAnalytics, RegistrationCount, {
    theme: Ember.inject.service(), // jshint ignore:line
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: {
        page: 'page',
        queryString: 'q',
        registrationType: 'type',
        providerFilter: 'provider',
    },

    activeFilters: { providers: [], types: [] },

    osfProviders: [
        'OSF',
        'AEA Registry', //These need to be added to the language filter once on SHARE (OSF -> OSF Registries)
        'ANZCTR',
        'Clinicaltrials.gov',
        'EGAP',
        'EU Clinical Trials',
        'ISRCTN',
        'Research Registry',
        'RIDIE'
    ],

    whiteListedProviders: [].map(item => item.toLowerCase()),

    registrationTypes: [
        'Prereg Challenge',
        'Open-Ended Registration',
        'AsPredicted Preregistration',
        'OSF-Standard Pre-Data Collection Registration',
        'Replication Recipe (Brandt et al., 2013): Pre-Registration',
        'Replication Recipe (Brandt et al., 2013): Post-Completion',
        'Pre-Registration in Social Psychology (van \'t Veer & Giner-Sorolla, 2016): Pre-Registration',
        'Election Research Preacceptance Competition'
    ],

    page: 1,
    size: 10,
    numberOfResults: 0,
    queryString: '',
    typeFilter: null,
    queryBody: {},
    providersPassed: false,

    sortByOptions: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],

    treeSubjects: Ember.computed('activeFilters', function() {
        return this.get('activeFilters.subjects').slice();
    }),
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
    trackDebouncedSearch() {
        // For use in tracking debounced search of registries in Keen and GA
        const category = 'input';
        const action = 'onkeyup';
        const label = 'Registries - Discover - Search';
        this.send('dualTrack', category, action, label, this.get('queryString'));
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

                result.contributors = result.lists.contributors
                  .sort((b, a) => (b.order_cited || -1) - (a.order_cited || -1))
                  .map(contributor => ({
                        users: Object.keys(contributor)
                          .reduce(
                              (acc, key) => Ember.merge(acc, {[key.camelize()]: contributor[key]}),
                              {bibliographic: contributor.relation !== 'contributor'}
                          )
                    }));

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
            sort.date_updated = 'asc';
        } else if (sortByOption === 'Upload date (newest to oldest)') {
            sort.date_updated = 'desc';
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
        trackSearch() {
            // Tracks search on keypress, debounced
            Ember.run.debounce(this, this.trackDebouncedSearch, 3000);
        },
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

            const category = `${event && event.type === 'keyup' ? 'input' : 'button'}`;
            const action = `${event && event.type === 'keyup' ? 'onkeyup' : 'click'}`;
            const label = 'Registries - Discover - Search';

            if (action === 'click') {
                // Only want to track search here when button clicked. Keypress search tracking is debounced in trackSearch
                this.send('dualTrack', category, action, label, this.get('queryString'));
            }
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

            this.send('dualTrack', 'button', 'click', 'Registries - Discover - Clear Filters');
        },

        sortBySelect(index) {
            // Selecting an option just swaps it with whichever option is first
            let copy = this.get('sortByOptions').slice(0);
            let temp = copy[0];
            copy[0] = copy[index];
            copy[index] = temp;
            this.set('sortByOptions', copy);
            this.set('page', 1);
            this.loadPage();

            this.send('dualTrack', 'dropdown', 'select', `Registries - Discover - Sort by: ${copy[0]}`);
        },

        updateFilters(filterType, item) {
            item = typeof item === 'object' ? item.text : item;
            const filters = this.get(`activeFilters.${filterType}`);
            const hasItem = filters.includes(item);
            const action = hasItem ? 'remove' : 'push';
            filters[`${action}Object`](item);
            this.notifyPropertyChange('activeFilters');

            const category = 'filter';
            const act = hasItem ? 'remove' : 'add';
            const label = `Registries - Discover - ${filterType} ${item}`;

            this.send('dualTrack', category, act, label);
        },
    },
});
