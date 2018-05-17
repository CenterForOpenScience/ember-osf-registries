import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
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
 *      activeFilters=activeFilters
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

    registrationTypeCache: null,
    setVisibilityOfOSFFilters: computed('activeFilters.providers', function() {
        if (this.OSFIsSoleProvider()) {
            if (this.get('registrationTypeCache')) {
                this.set('activeFilters.types', $.extend(true, [], this.get('registrationTypeCache')));
                this.set('registrationTypeCache', null);
            }
            $('.type-selector-warning').hide();
            $('.registration-type-selector').fadeTo('slow', 1);
            return false;
        } else {
            this.set('registrationTypeCache', $.extend(true, [], this.get('activeFilters.types')));
            $('.type-selector-warning').show();
            $('.registration-type-selector').fadeTo('slow', 0.5);
            return true;
        }
    }),
    init() {
        this._super(...arguments);
        this.get('store')
            .findAll('metaschema')
            .then(this._returnResults.bind(this))
            .catch(this._errorMessage.bind(this));
    },
    _returnResults(results) {
        const typeArr = [];
        results.forEach(function(result) {
            typeArr.push(result.get('name'));
        });
        typeArr.push('Election Research Preacceptance Competition');
        typeArr.sort();
        this.set('registrationTypes', typeArr);
    },
    _errorMessage() {
        this.get('toast').error(this.get('i18n').t('discover.type_error'));
    },
    OSFIsSoleProvider() {
        let soleProvider = false;
        const providers = this.get('activeFilters.providers');
        if (providers.length === 1 && providers[0] === 'OSF') {
            soleProvider = true;
        }
        return soleProvider;
    },
});
