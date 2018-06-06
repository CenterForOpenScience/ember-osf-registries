import { moduleForComponent, test } from 'ember-qunit';
import EmberService from '@ember/service';
import EmberObject from '@ember/object';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

const storeStub = EmberService.extend({
    findAll() {
        const results = [
            EmberObject.create({ name: 'AsPredicted Preregistration' }),
        ];
        return Promise.resolve(results);
    },
});

moduleForComponent('search-facet-registration-type', 'Integration | Component | search facet registration type', {
    integration: true,

    beforeEach() {
        this.register('service:store', storeStub);
        this.inject.service('store', { as: 'store' });
        this.set('facet', { key: 'registration_type', title: 'OSF Registration Type', component: 'search-facet-registration-type' });
        this.set('key', 'registration_type');
        const noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', { providers: [], types: [] });
        this.set('filterReplace', { 'Open Science Framework': 'OSF' });
    },
});

test('it renders', function(assert) {
    this.render(hbs`{{search-facet-registration-type
        key=key
        options=facet
        updateFilters=(action noop) 
        activeFilters=activeFilters
        filterReplace=filterReplace
    }}`);

    return wait()
        .then(() => {
            assert.equal(this.$('ul > li')[0].innerText.trim(), 'AsPredicted Preregistration');
        });
});
