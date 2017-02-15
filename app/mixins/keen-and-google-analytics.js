import Ember from 'ember';
import Analytics from '../mixins/analytics';
import KeenTracker from 'ember-osf/mixins/keen-tracker';

/**
 * @module ember-osf-registries
 * @submodule mixins
 */

/**
 * Allows events to be sent to both GA and keen
 *
 * @class KeenAndGoogleAnalyticsMixin
 * */

export default Ember.Mixin.create(Analytics, KeenTracker, {
    actions: {
        // Sends click event to both GA and Keen
        dualTrackClick(category, label, extra) {
            if (extra && extra.toString() === '[object MouseEvent]') {
                extra = null;
            }
            this.send('click', category, label);
            this.send('keenClick', category, label, extra);
        },
        // Sends event to both GA and Keen
        dualTrack(category, action, label, extra) {
            this.send('track', category, action, label);
            this.send('keenTrack', category, action, label, extra);
        }
    }

});
