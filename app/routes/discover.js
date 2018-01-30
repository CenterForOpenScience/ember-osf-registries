import Route from '@ember/routing/route';
import Analytics from 'ember-osf/mixins/analytics';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Route.extend(Analytics, ResetScrollMixin, {
    queryParams: {
        queryString: {
            replace: true,
        },
    },
    model() {
        return this
            .get('store')
            .findAll('preprint-provider', { reload: true })
            .then(result => result.filter(item => item.id !== 'osf'));
    },
    actions: {
        willTransition() {
            const controller = this.controllerFor('discover');
            controller._clearFilters();
            controller._clearQueryString();
        },
    },
});
