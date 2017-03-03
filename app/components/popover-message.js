import Ember from 'ember';

export default Ember.Component.extend({
    didInsertElement: function() {
        this.$('#registries-popover').popover();
    },

});
