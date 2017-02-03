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
        dualTrackClick(category, label, node) {
            this.send('click', category, label, node);
            this.send('keenClick', category, label, node);
            },
        // Sends event to both GA and Keen
        dualTrack(category, action, label, node) {
            this.send('track', category, label, node);
            this.send('keenTrack', category, label, node);
        }
    }

});
