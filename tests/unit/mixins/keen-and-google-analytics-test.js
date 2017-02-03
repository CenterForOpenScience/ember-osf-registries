import Ember from 'ember';
import KeenAndGoogleAnalyticsMixin from 'registries-service/mixins/keen-and-google-analytics';
import { module, test } from 'qunit';

module('Unit | Mixin | keen and google analytics');

// Replace this with your real tests.
test('it works', function(assert) {
  let KeenAndGoogleAnalyticsObject = Ember.Object.extend(KeenAndGoogleAnalyticsMixin);
  let subject = KeenAndGoogleAnalyticsObject.create();
  assert.ok(subject);
});
