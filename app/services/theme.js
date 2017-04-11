import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),

    id: config.REGISTRIES.defaultProvider,

    currentLocation: null,

    provider: Ember.computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        return this
            .get('store')
            .findRecord('preprint-provider', id);
    }),

    isProvider: Ember.computed('id', function() {
        const id = this.get('id');
        return id && id !== 'osf';
    }),

    stylesheet: Ember.computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `/registries/assets/css/${id}${suffix}.css`;
    }),

    logoSharing: Ember.computed('id', function() {
        const id = this.get('id');

        const logo = config.REGISTRIES.providers
            .find(provider => provider.id === id)
            .logoSharing;

        logo.path = `/registries${logo.path}`;

        return logo;
    }),

    signupUrl: Ember.computed('id', 'currentLocation', function() {
        const query = Ember.$.param({
            // TODO enable once a registries campaign is ready
            // campaign: `${this.get('id')}-registries`,
            next: this.get('currentLocation')
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: Ember.computed('currentLocation', function() {
        return this.get('currentLocation');
    }),
});
