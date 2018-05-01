import Route from '@ember/routing/route';
import { inject } from '@ember/service';

import OSFAgnosticAuthRouteMixin from 'ember-osf/mixins/osf-agnostic-auth-route';
import Analytics from 'ember-osf/mixins/analytics';

export default Route.extend(Analytics, OSFAgnosticAuthRouteMixin, {
    i18n: inject(),
    afterModel() {
        const availableLocales = this.get('i18n.locales').toArray();
        let locale;

        // Works in Chrome and Firefox (editable in settings)
        if (navigator.languages && navigator.languages.length) {
            for (const lang of navigator.languages) {
                if (availableLocales.includes(lang)) {
                    locale = lang;
                    break;
                }
            }
        } else if (navigator.language && availableLocales.includes(navigator.language)) {
            // Backup for Safari (uses system settings)
            locale = navigator.language;
        }

        if (locale) { this.set('i18n.locale', locale); }
    },
});
