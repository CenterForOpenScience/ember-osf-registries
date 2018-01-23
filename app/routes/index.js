import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from 'ember-osf/mixins/analytics';

export default Route.extend(Analytics, ResetScrollMixin,  {
    // store: inject(),
    theme: inject(),
    model() {
        return hash({
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
