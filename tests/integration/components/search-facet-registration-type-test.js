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
        this.set('facet', { key: 'type', title: 'OSF Registration Type', component: 'search-facet-registration-type' });
        this.set('key', 'type');
        const noop = () => {};
        this.set('noop', noop);
        this.set('filterReplace', { 'Open Science Framework': 'OSF' });
        this.set('state', { value: [] });
        this.set('states', { provider: { value: [] } });
    },
});

test('it renders', function(assert) {
    this.render(hbs`{{search-facet-registration-type
        key=key
        options=facet
        updateFilters=(action noop)
        state=state
        states=states
        filterReplace=filterReplace
    }}`);

    return wait()
        .then(() => {
            assert.equal(this.$('ul > li')[0].innerText.trim(), 'AsPredicted Preregistration');
        });
});
