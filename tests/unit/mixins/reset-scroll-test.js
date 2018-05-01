import Ember from 'ember';
import ResetScrollMixin from 'registries-service/mixins/reset-scroll';
import { module, test } from 'qunit';

module('Unit | Mixin | reset scroll');

// Replace this with your real tests.
test('it works', function(assert) {
    const ResetScrollObject = Ember.Object.extend(ResetScrollMixin);
    const subject = ResetScrollObject.create();
    assert.ok(subject);
});
