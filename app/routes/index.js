import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin,  {
    // store: Ember.inject.service(),
    theme: Ember.inject.service(),
    model() {
        return Ember.RSVP.hash({
            taxonomies: this.get('theme.provider')
                .then(provider => provider
                    .queryHasMany('taxonomies', {
                        filter: {
                            parents: 'null'
                        },
                        page: {
                            size: 20
                        }
                    })
                ),
            brandedProviders: this
                .store
                .findAll('preprint-provider', { reload: true })
                .then(result => result
                    .filter(item => item.id !== 'osf')
                )
        });
    },
    actions: {
        search(q) {
            let route = 'discover';

            if (this.get('theme.isProvider'))
                route = `provider.${route}`;

            this.transitionTo(route, { queryParams: { q: q } });
        }
    }
});
