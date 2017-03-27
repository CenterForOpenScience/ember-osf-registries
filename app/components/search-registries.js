import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

export default Ember.Component.extend(Analytics, {
    metrics: Ember.inject.service(),
    actions: {
        search() {
            let query = Ember.$.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Index - Search',
                    extra: query
                });
        }
    },

    keyDown(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode === 13) {
            this.send('search');
        }
    }
});
