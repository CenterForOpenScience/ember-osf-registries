import Ember from 'ember';
import config from 'ember-get-config';
import KeenAndGoogleAnalytics from '../mixins/keen-and-google-analytics';
import RegistrationCount from '../mixins/registration-count';

export default Ember.Controller.extend(KeenAndGoogleAnalytics, RegistrationCount, {
    theme: Ember.inject.service(),
    recentRegistrations: Ember.A(),
    init() {
        this._super(...arguments);
        const filter = [
            {
                term: {
                    'types.raw': 'registration'
                }
            },
            {
                term: {
                    'sources.raw': this.get('theme.isProvider') ? this.get('theme.id') : 'OSF'
                }
            }
        ];
        const getTotalPayload = {
            size: 5,
            from: 0,
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: '*'
                        }
                    },
                    filter
                }
            }
        };

        Ember.$.ajax({
            type: 'POST',
            url: config.SHARE.searchUrl,
            data: JSON.stringify(getTotalPayload),
            contentType: 'application/json',
            crossDomain: true,
        })
        .then(results => {
            this.set('recentRegistrations', results.hits.hits.map(each => ({
                title: each._source.title,
                url: each._source.identifiers[2],
                contributors: each._source.lists.contributors.sort((b, a) => (b.order_cited || -1) - (a.order_cited || -1)).map(contributor => ({
                    users: Object.keys(contributor)
                    .reduce(
                        (acc, key) => Ember.merge(acc, {[key.camelize()]: contributor[key]}),
                        {bibliographic: contributor.relation !== 'contributor'}
                    )
                }))
            })));
        });
    },
});
