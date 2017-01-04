import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';

export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
    sharePreprintsTotal: null,
    recentRegistrations: Ember.A(),
    init() {
        // Fetch total number of preprints. Allow elasticsearch failure to pass silently.
        // This is considered to be a one-time fetch, and therefore is run in controller init.
        const filter = [
            {
                term: {
                    'types.raw': 'registration'
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

        if (this.get('theme.isProvider')) {
            filter.push({
                term: {
                    // TODO filter by name and use sources.raw (potential conflicts later), Needs API name to match SHARE source
                    sources: this.get('theme.id')
                }
            });
        }

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
                url: each._source.identifiers[0]
            })));
            this.set('sharePreprintsTotal', results.hits.total);
        });

        this.set('currentDate', new Date());
    },
});
