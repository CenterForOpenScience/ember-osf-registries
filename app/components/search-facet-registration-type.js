import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

import { task } from 'ember-concurrency';
import $ from 'jquery';

/**
 * @module ember-osf-registries
 * @submodule components
 */

/**
 * Builds registry's registration type facet for discover page
 * To be used with Ember-OSF's discover-page component and faceted-search component.
 *
 * Sample usage:
 * ```handlebars
 * {{search-facet-registration-type
 *      updateFilters=(action 'updateFilters')
 *      options=facet
 *      filterReplace=filterReplace
 *      key=key
 * }}
 * ```
 * @class search-facet-registration-type
 */
export default Component.extend({
    store: service(),
    toast: service(),
    i18n: service(),

    setVisibilityOfOSFFilters: computed('state.value', function() {
        if (this.OSFIsSoleProvider()) {
            $('.type-selector-warning').hide();
            $('.registration-type-selector').fadeTo('slow', 1);
            return false;
        } else {
            $('.type-selector-warning').show();
            $('.registration-type-selector').fadeTo('slow', 0.5);
            return true;
        }
    }),

    init() {
        this._super(...arguments);
        this.get('fetchData').perform();
    },

    fetchData: task(function* () {
        try {
            const results = yield this.get('store').findAll('metaschema');
            const typeArr = results.map(result => result.get('name'));
            // Manually add 'Election Research Preacceptance Competition' to the list of possible
            // facets. Metaschema was removed from the API as a possible registration type
            // but should still be searchable
            typeArr.push('Election Research Preacceptance Competition');
            typeArr.sort();
            this.set('registrationTypes', typeArr);
        } catch (e) {
            this.get('toast').error(this.get('i18n').t('discover.registration_metaschema_error'));
        }
    }),

    OSFIsSoleProvider() {
        let soleProvider = false;
        const providers = this.get('states.provider.value');
        if (providers.length === 1 && providers[0] === 'OSF') {
            soleProvider = true;
        }
        return soleProvider;
    },
});
