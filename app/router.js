import EmberRouter from '@ember/routing/router';
import { inject } from '@ember/service';
import { run } from '@ember/runloop';
import config from 'ember-get-config';

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL,
    metrics: inject(),
    theme: inject(),
    session: inject(),

    didTransition() {
        this._super(...arguments);
        this._trackPage();
    },

    _trackPage() {
        run.scheduleOnce('afterRender', this, () => {
            // Tracks page with custom parameters
            // authenticated => if the user is logged in or not
            // isPublic      => if the resource the user is viewing is public or private.
            //                  n/a is used for pages like discover and index
            // page          => the name of the current page
            // resource      => what resource the user is on. Ex node, preprint, registry.
            // title         => the current route name

            const {
                authenticated,
                isPublic,
                resource,
            } = config.metricsAdapters[0].dimensions;
            const page = document.location.pathname;
            const title = this.getWithDefault('currentRouteName', 'unknown');
            const isAuthenticated = this.get('session.isAuthenticated');

            this.get('metrics').trackPage({
                [authenticated]: isAuthenticated ? 'Logged in' : 'Logged out',
                [isPublic]: 'n/a',
                page,
                [resource]: 'n/a',
                title,
            });
            this.set('theme.currentLocation', window.location.href);
        });
    },
});

/* eslint-disable array-callback-return */

Router.map(function() {
    this.route('page-not-found', { path: '/*bad_url' });
    this.route('index', { path: 'registries' });
    this.route('page-not-found', { path: 'registries/page-not-found' });
    this.route('discover', { path: 'registries/discover' });
    this.route('provider', { path: 'registries/:slug' }, function() {
        this.route('discover');
        this.route('page-not-found');
    });
    this.route('forbidden');
});

/* eslint-enable array-callback-return */

export default Router;
