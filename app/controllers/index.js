import Ember from 'ember';
import config from 'ember-get-config';
import KeenAndGoogleAnalytics from '../mixins/keen-and-google-analytics';
import RegistrationCount from '../mixins/registration-count';

const PLACEHOLDER_DATA = [
    {
        title: 'Local conditions explain variation in plant phenology within species',
        url: 'https://osf.io/6tsnj/'
    },
    {
        title: 'The Role of Framing Effects, the Dark Triad and Empathy in Predicting Behavior in a One-shot Prisoner\'s Dilemma',
        url: 'https://osf.io/aurjt/'
    },
    {
        title: 'Promoting School Belongingness and Academic Performance: A Multisite Effectiveness Trial of a Scalable Student Mindset Intervention',
        url: 'https://osf.io/e94t8/'
    },
    {
        title: 'Does Practicing Cognitive Reappraisal Enhance Impulse Inhibition during Subsequent Risk Taking?',
        url: 'https://osf.io/2tpy9/'
    },
    {
        title: 'On the role of lower- and upper-bounded contexts in realizing scalar inferences',
        url: 'https://osf.io/2ds52/'
    },
];

export default Ember.Controller.extend(KeenAndGoogleAnalytics, RegistrationCount, {
    theme: Ember.inject.service(),
    recentRegistrations: Ember.A(),
    init() {
        this._super(...arguments);
        if (config.useSHAREData) {
            const filter = [
                {
                    terms: {
                        type: ['registration']
                    }
                },
                {
                    terms: {
                        sources: this.get('theme.isProvider') ? this.get('theme.id') : 'OSF'
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
        } else {
            this.set('recentRegistrations', PLACEHOLDER_DATA);
        }
    },
});
