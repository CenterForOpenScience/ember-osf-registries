import Route from '@ember/routing/route';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';

export default Route.extend(Analytics, ResetScrollMixin, {
});
