import Ember from 'ember';
import KeenAndGoogleAnalytics from '../mixins/keen-and-google-analytics';

export default Ember.Component.extend(KeenAndGoogleAnalytics, {
    actions: {
        search() {
            let query = Ember.$.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
            this.send('dualTrackClick', 'button', 'Registries - Index - Search');
        }
    },

    keyDown(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode === 13) {
            this.send('search');
        }
    }
});
