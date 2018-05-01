import Route from '@ember/routing/route';
import Analytics from 'ember-osf/mixins/analytics';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Route.extend(Analytics, ResetScrollMixin, {
});
