import Service from '@ember/service';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import $ from 'jquery';
import config from 'ember-get-config';

export default Service.extend({
    store: inject(),
    session: inject(),

    id: config.REGISTRIES.defaultProvider,

    currentLocation: null,

    provider: computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        return this
            .get('store')
            .findRecord('preprint-provider', id);
    }),

    isProvider: computed('id', function() {
        const id = this.get('id');
        return id && id !== 'osf';
    }),

    stylesheet: computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `/registries/assets/css/${id}${suffix}.css`;
    }),

    logoSharing: computed('id', function() {
        const id = this.get('id');

        const logo = config.REGISTRIES.providers
            .find(provider => provider.id === id)
            .logoSharing;

        logo.path = `/registries${logo.path}`;

        return logo;
    }),

    signupUrl: computed('id', 'currentLocation', function() {
        const query = $.param({
            campaign: `${this.get('id')}-registries`,
            next: this.get('currentLocation')
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: computed('currentLocation', function() {
        return this.get('currentLocation');
    }),
});
