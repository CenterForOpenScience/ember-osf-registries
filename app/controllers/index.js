import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';
import RegistrationCount from '../mixins/registration-count';

const PLACEHOLDER_DATA = [
    {
        title: 'Local conditions explain variation in plant phenology within species',
        url: 'https://osf.io/6tsnj/register/565fb3678c5e4a66b5582f67',
        contributors: [
            {users: {name: 'Margaret Kosmala', bibliographic: true}}
        ]
    },
    {
        title: 'The Role of Framing Effects, the Dark Triad and Empathy in Predicting Behavior in a One-shot Prisoner\'s Dilemma',
        url: 'https://osf.io/aurjt/register/565fb3678c5e4a66b5582f67',
        contributors: [
            {users: {name: 'Paul Michael Deutchman', bibliographic: true}},
            {users: {name: 'Jess Sullivan', bibliographic: true}}
        ]
    },
    {
        title: 'Promoting School Belongingness and Academic Performance: A Multisite Effectiveness Trial of a Scalable Student Mindset Intervention',
        url: 'https://osf.io/e94t8/register/565fb3678c5e4a66b5582f67',
        contributors: [
            {users: {name: 'Geoffrey Borman', bibliographic: true}},
            {users: {name: 'Jon Baron', bibliographic: true}}
        ]
    },
    {
        title: 'Does Practicing Cognitive Reappraisal Enhance Impulse Inhibition during Subsequent Risk Taking?',
        url: 'https://osf.io/2tpy9/register/565fb3678c5e4a66b5582f67',
        contributors: [
            {users: {name: 'Joao F. Guassi Moreira', bibliographic: true}},
            {users: {name: 'Emilia Ninova', bibliographic: true}},
            {users: {name: 'Jennifer Silvers', bibliographic: true}}
        ]
    },
    {
        title: 'On the role of lower- and upper-bounded contexts in realizing scalar inferences',
        url: 'https://osf.io/2ds52/register/565fb3678c5e4a66b5582f67',
        contributors: [
            {users: {name: 'Stephen Politzer-Ahles', bibliographic: true}},
            {users: {name: 'Edward Matthew Husband', bibliographic: true}}
        ]
    },
];


export default Ember.Controller.extend(Analytics, RegistrationCount, {
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
