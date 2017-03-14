import Ember from 'ember';
import Analytics from '../mixins/analytics';
import RegistrationCount from '../mixins/registration-count';

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
    facets: [ // List of facets available for registries
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
    page: 1,
    provider: '',
    q: '',
    queryParams: ['page', 'q', 'provider', 'type'],
    searchButton: Ember.computed('i18n', function() { // Search button text
        return this.get('i18n').t('global.search');
    }),
    searchPlaceholder: Ember.computed('i18n', function() { // Search bar placeholder
        return this.get('i18n').t('discover.search.placeholder');
    }),
    showActiveFilters: true, //should always have a provider, don't want to mix osfProviders and non-osf
    sortOptions: [{ // Sort options for preprints
        display: 'Relevance',
        sortBy: ''
    }, {
        display: 'Upload date (newest to oldest)',
        sortBy: '-date_updated'
    }, {
        display: 'Upload date (oldest to newest)',
        sortBy: 'date_updated'
    }],
    type: '',

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
    }
});
