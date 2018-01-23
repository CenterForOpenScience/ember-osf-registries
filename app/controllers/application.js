import Controller from '@ember/controller';
import { inject } from '@ember/service';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

export default Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: inject(),
    theme: inject(),
});
