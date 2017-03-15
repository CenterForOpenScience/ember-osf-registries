import Ember from 'ember';
import Analytics from '../mixins/analytics';
import RegistrationCount from '../mixins/registration-count';

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
export default Ember.Controller.extend(Analytics, RegistrationCount, {
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(), // jshint ignore:line
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js

    activeFilters: { providers: [], types: [] }, // Active filters for registries service
    clearFiltersButton: Ember.computed('i18n', function() { // Text of clear filters button
        return this.get('i18n').t('discover.main.active_filters.button');
    }),
    consumingService: 'registries', // Consuming service - registries here
    discoverHeader: Ember.computed('i18n', function() { // Header for registries discover page
        return this.get('i18n').t('index.header.title.paragraph');
    }),
    facets: [// List of facets available for registries
        { key: 'sources', title: 'Providers', component: 'search-facet-provider' },
        { key: 'registration_type', title: 'OSF Registration Type', component: 'search-facet-registration-type' }
    ],
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
    lockedParams: {types: 'registration'}, // Parameter names which cannot be changed
    page: 1, // Query param
    provider: '', // Query param
    q: '', // Query param
    queryParams: ['page', 'q', 'provider', 'type'],
    searchButton: Ember.computed('i18n', function() { // Search button text
        return this.get('i18n').t('global.search');
    }),
    searchPlaceholder: Ember.computed('i18n', function() { // Search bar placeholder
        return this.get('i18n').t('discover.search.placeholder');
    }),
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

    init() {
        this._super(...arguments);
        Ember.run.schedule('afterRender', () => {
            let providers = this.get('activeFilters.providers');
            if (providers.length === 1 && providers[0] === 'OSF') {
                return;
            }
            this.toggleTypeCSS(false);
        });
    },
    registrationTypeCache: null,
    setVisibilityOfOSFFilters: Ember.observer('provider', function() {
        if (this.get('provider') === 'OSF') {
            if (this.get('registrationTypeCache')) {
                this.set('type', this.get('registrationTypeCache'));
                this.set('registrationTypeCache', null);
            }
            this.toggleTypeCSS(true);
        } else {
            if (this.get('type')) {
                this.set('registrationTypeCache', this.get('type'));
                this.set('type', '');
                this.set('activeFilters.types', []);
                this.notifyPropertyChange('activeFilters');
            }
            this.toggleTypeCSS(false);
        }
    }),
    // Disables search-facet-registration-type
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
    // TODO _clearFilters has been moved to the Ember-OSF discover-page component.
    // Call this in willDestroyElement hook or similar of component?
    _clearFilters() {
        this.set('activeFilters', {
            providers: this.get('theme.isProvider') ? this.get('activeFilters.providers') : [],
            types: []
        });
    },
    _clearQueryString() {
        this.set('q', '');
    }
});
