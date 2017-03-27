import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
});
