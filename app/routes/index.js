import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Route.extend(Analytics, ResetScrollMixin, {
    theme: inject(),

    actions: {
        search(q) {
            const route = this.get('theme.isProvider') ? 'provider.discover' : 'discover';

            this.transitionTo(route, { queryParams: { q } });
        },
    },
});
