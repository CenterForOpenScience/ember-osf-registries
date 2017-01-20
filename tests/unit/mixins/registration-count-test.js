import Ember from 'ember';
import RegistrationCountMixin from 'registries-service/mixins/registration-count';
import { module, test } from 'qunit';

module('Unit | Mixin | registration count');

// Replace this with your real tests.
test('it works', function(assert) {
  let RegistrationCountObject = Ember.Object.extend(RegistrationCountMixin);
  let subject = RegistrationCountObject.create();
  assert.ok(subject);
});
