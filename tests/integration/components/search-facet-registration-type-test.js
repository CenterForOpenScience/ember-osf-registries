import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-registration-type', 'Integration | Component | search facet registration type', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

    this.set('facet',  { key: 'registration_type', title: 'OSF Registration Type', component: 'search-facet-registration-type' });
    this.set('key', 'registration_type');
    let noop = () => {};
    this.set('noop', noop);
    this.set('activeFilters', { providers: [], types: [] });
    this.set('filterReplace',  {'Open Science Framework': 'OSF'});

    this.render(hbs`{{search-facet-registration-type
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
    }}`);

  assert.equal(this.$('ul > li')[0].innerText.trim(), "AsPredicted Preregistration");
});
