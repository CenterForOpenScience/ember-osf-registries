import Ember from 'ember';

/**
 * @module ember-osf-registries
 * @submodule components
 */

/**
 * Builds registry's registration type facet for discover page - to be used with Ember-OSF's discover-page component and faceted-search component.
 *
 * Sample usage:
 * ```handlebars
 * {{search-facet-registration-type
 *      updateFilters=(action 'updateFilters')
 *      activeFilters=activeFilters
 *      options=facet
 *      filterReplace=filterReplace
 *      key=key
 * }}
 * ```
 * @class search-facet-registration-type
 */
export default Ember.Component.extend({
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

    init() {
        this._super(...arguments);
        Ember.run.schedule('afterRender', () => {
            if (this.OSFIsSoleProvider()) {
                return;
            }
            this.toggleTypeCSS(false);
        });
    },
    registrationTypeCache: null,
    setVisibilityOfOSFFilters: Ember.observer('activeFilters.providers', function() {
        if (this.OSFIsSoleProvider()) {
            if (this.get('registrationTypeCache')) {
                this.set('activeFilters.types', Ember.$.extend(true, [], this.get('registrationTypeCache')));
                this.set('registrationTypeCache', null);
            }
            this.toggleTypeCSS(true);
        } else {
            this.set('registrationTypeCache', Ember.$.extend(true, [], this.get('activeFilters.types')));
            this.set('activeFilters.types', []);
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
    OSFIsSoleProvider() {
        let soleProvider = false;
        const providers = this.get('activeFilters.providers');
        if (providers.length === 1 && providers[0] === 'OSF') {
            soleProvider = true;
        }
        return soleProvider;
    }
});
