import EmberRouter from '@ember/routing/router';
import { inject } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { get } from '@ember/object';
import config from 'ember-get-config';

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL,
    metrics: inject(),
    theme: inject(),

    didTransition() {
        this._super(...arguments);
        this._trackPage();
    },

    _trackPage() {
        scheduleOnce('afterRender', this, () => {
            const page = document.location.pathname;
            const title = this.getWithDefault('currentRouteName', 'unknown');

            get(this, 'metrics').trackPage({ page, title });
            this.set('theme.currentLocation', window.location.href);
        });
    }
});

Router.map(function() {
    this.route('page-not-found', {path: '/*bad_url'});
    this.route('index', {path: 'registries'});
    this.route('page-not-found', {path: 'registries/page-not-found'});
    this.route('discover', {path: 'registries/discover'});
    this.route('provider', {path: 'registries/:slug'}, function() {
        this.route('discover');
        this.route('page-not-found');
    });
    this.route('forbidden');
});

export default Router;
