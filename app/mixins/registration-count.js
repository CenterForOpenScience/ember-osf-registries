import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Mixin.create({
    init() {
        // Fetch total number of preprints. Allow elasticsearch failure to pass silently.
        // This is considered to be a one-time fetch, and therefore is run in controller init.
        const filter = [
            {
                terms: {
                    type: ['registration']
                }
            }
        ];
        const getTotalPayload = {
            size: 0,
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
                terms: {
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
        .then(results => this.set('shareRegistriesTotal', results.hits.total));

        this.set('currentDate', new Date());
    }
});
