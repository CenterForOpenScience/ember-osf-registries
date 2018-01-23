import Component from '@ember/component';
import { inject } from '@ember/service';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(OSFAgnosticAuthControllerMixin, Analytics, {
    session: inject(),
    theme: inject(),
    tagName: 'nav',
    classNames: ['navbar', 'branded-navbar', 'preprint-navbar']
});
