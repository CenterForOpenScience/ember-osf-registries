import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';
import { get } from '@ember/object';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    metrics: inject(),
    actions: {
        search() {
            let query = $.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
            get(this, 'metrics')
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
