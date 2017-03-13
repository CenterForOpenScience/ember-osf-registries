import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-registration-type', 'Integration | Component | search facet registration type', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{search-facet-registration-type}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#search-facet-registration-type}}
      template block text
    {{/search-facet-registration-type}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
