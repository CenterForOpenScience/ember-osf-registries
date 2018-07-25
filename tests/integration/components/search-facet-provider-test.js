import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-provider', 'Integration | Component | search facet provider', {
    integration: true,
    beforeEach() {
        const osfProvider = {
            doc_count: 99,
            key: 'OSF',
        };
        const clinicalTrialsProvider = {
            doc_count: 100,
            key: 'ClinicalTrials.gov',
        };
        const otherProviders = A([
            osfProvider,
            clinicalTrialsProvider,
        ]);

        this.set('otherProviders', otherProviders);
        this.set('facet', { key: 'provider', title: 'Providers', component: 'search-facet-provider' });
        this.set('key', 'provider');
        const noop = () => {};
        this.set('noop', noop);
        this.set('filterReplace', { 'Open Science Framework': 'OSF' });
    },
});

test('preprint providers and counts are listed', function(assert) {
    this.render(hbs`{{search-facet-provider
        updateFilters=(action noop)
        options=facet
        filterReplace=filterReplace
        otherProviders=otherProviders
    }}`);
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
    assert.equal(this.$('label')[1].innerText.trim(), 'ClinicalTrials.gov (100)');
});

test('filterReplace looks up key in mapping', function(assert) {
    const osfProvider = {
        doc_count: 99,
        key: 'Open Science Framework',
    };
    this.set('otherProviders', A([osfProvider]));
    this.render(hbs`{{search-facet-provider
        key=key
        options=facet
        updateFilters=(action noop)
        filterReplace=filterReplace
        otherProviders=otherProviders
    }}`);
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
});
