import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { not } from '@ember/object/computed';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

export default Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: inject(),
    theme: inject(),
    session: inject(),

    init() {
        this._super(...arguments);

        if (document.cookie.includes('osf_cookieconsent')) {
            this.set('hasCookie', true);
        }
    },

    hasCookie: false,
    notAuthenticated: not('session.isAuthenticated'),

    actions: {
        addCookie() {
            // Make new cookie with expiration date 10 years in future
            const CookieDate = new Date();
            CookieDate.setFullYear(CookieDate.getFullYear() + 10);
            document.cookie = `osf_cookieconsent=1;path=/;expires=${CookieDate.toGMTString()};`;
            this.set('hasCookie', true);
        },
    },
});
