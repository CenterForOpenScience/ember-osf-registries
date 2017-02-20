import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';
import KeenTracker from 'ember-osf/mixins/keen-tracker';

export default Ember.Route.extend(Analytics, ResetScrollMixin, KeenTracker, {
    queryParams: {
        queryString: {
            replace: true
        }
    },
    model() {
        return this
            .get('store')
            .findAll('preprint-provider', { reload: true })
            .then(result => result.filter(item => item.id !== 'osf'));
    },
});
