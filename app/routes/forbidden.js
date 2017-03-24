import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
});
