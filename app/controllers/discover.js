import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-osf-registries
 * @submodule controllers
 */

/**
 * @class Discover Controller
 *
 * Most of the discover page is built using the discover-page component in ember-osf. The component is largely based on
 * SHARE's discover interface (https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js) and
 * the existing preprints/registries interfaces
 */
export default Ember.Controller.extend(Analytics, {
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(), // jshint ignore:line
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    activeFilters:  { providers: [], types: []},
    consumingService: 'registries', // Consuming service - registries here
    facets: Ember.computed('i18n.locale', function() { // List of facets available for registries
        return [
            { key: 'sources', title: `${this.get('i18n').t('discover.main.providers')}`, component: 'search-facet-provider' },
            { key: 'registration_type', title: `${this.get('i18n').t('discover.main.type')}`, component: 'search-facet-registration-type' }
        ]
    }),
    filterMap: { // Map active filters to facet names expected by SHARE
        providers: 'sources',
        types: 'registration_type'
    },
    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Registries',
        'Research Papers in Economics': 'RePEc'
    },
    lockedParams: {types: ['registration']}, // Parameter names which cannot be changed
    page: 1, // Query param
    provider: '', // Query param
    q: '', // Query param
    queryParams: ['page', 'q', 'provider', 'type'],
    searchPlaceholder: 'discover.search.placeholder',
    showActiveFilters: true, //should always have a provider, don't want to mix osfProviders and non-osf
    sortOptions: Ember.computed('i18n.locale', function() { // Sort options for registries
        const i18n = this.get('i18n');
        return [{
            display: i18n.t('discover.relevance'),
            sortBy: ''
        }, {
            display: i18n.t('discover.sort_oldest_newest'),
            sortBy: 'date_updated'
        }, {
            display: i18n.t('discover.sort_newest_oldest'),
            sortBy: '-date_updated'
        }];
    }),
    type: '', // Query param
    _clearFilters() {
        this.set('activeFilters', {
            providers: [],
            types: []
        });
        this.set('type', '');
        this.set('provider', '');
    },
    _clearQueryString() {
        this.set('q', '');
    }
});
