import Controller from '@ember/controller';
import { inject } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';

export default Controller.extend(Analytics, {
    theme: inject(),
});
