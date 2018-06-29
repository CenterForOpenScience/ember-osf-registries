import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';
import config from 'ember-get-config';

const getProvidersPayload = '{"from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"types": "registration"}}]}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

/**
 * @module ember-osf-registries
 * @submodule components
 */

/**
 * Builds registry's provider facet for discover page.
 * To be used with Ember-OSF's discover-page component and faceted-search component.
 *
 * Sample usage:
 * ```handlebars
 * {{search-facet-provider
 *      updateFilters=(action 'updateFilters')
 *      options=facet
 *      filterReplace=filterReplace
 *      key=key
 * }}
 * ```
 * @class search-facet-provider
 */
export default Component.extend({
    store: inject(),
    theme: inject(),
    whiteListedProviders: [
        'OSF',
        'ClinicalTrials.gov',
        'Research Registry',
    ].map(item => item.toLowerCase()),

    init() {
        this._super(...arguments);

        if (!this.get('otherProviders')) this.set('otherProviders', []);

        if (!this.get('osfProviders')) {
            this.set(
                'osfProviders',
                [
                    'OSF',
                    // These need to be added to the language filter once on SHARE
                    // 'AEA Registry',
                    // 'ANZCTR',
                    // 'Clinicaltrials.gov',
                    // 'EGAP',
                    // 'EU Clinical Trials',
                    // 'ISRCTN',
                    // 'Research Registry',
                    // 'RIDIE'
                ],
            );
        }

        $.ajax({
            type: 'POST',
            url: this.get('searchUrl'),
            data: getProvidersPayload,
            contentType: 'application/json',
            crossDomain: true,
        }).then(this._returnResults.bind(this));
    },
    _returnResults(results) {
        const hits = results.aggregations.sources.buckets;
        const whiteList = this.get('whiteListedProviders');
        const providers = hits
            .filter(hit => whiteList.includes(hit.key.toLowerCase()));

        providers.push(...this.get('osfProviders')
            .filter(key => !providers
                .find(hit => hit.key.toLowerCase() === key.toLowerCase()))
            .map(key => ({
                key,
                doc_count: 0,
            })));

        providers
            .sort((a, b) => (a.key.toLowerCase() < b.key.toLowerCase() ? -1 : 1))
            .unshift(...providers.splice(
                providers.findIndex(item => item.key === 'OSF'),
                1,
            ));

        if (!this.get('theme.isProvider')) {
            this.set('otherProviders', providers);
        } else {
            const filtered = providers.filter(item => item.key.toLowerCase() === this.get('theme.id').toLowerCase());

            this.set('otherProviders', filtered);
            this.get('state.value').pushObject(filtered[0].key);
        }

        this.notifyPropertyChange('otherProviders');
    },
    searchUrl: config.OSF.shareSearchUrl,
});
