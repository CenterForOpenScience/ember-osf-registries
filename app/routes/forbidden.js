import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';
import KeenTracker from 'ember-osf/mixins/keen-tracker';

export default Ember.Route.extend(Analytics, ResetScrollMixin, KeenTracker, {
});
