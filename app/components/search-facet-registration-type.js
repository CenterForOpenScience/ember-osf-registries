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
});
