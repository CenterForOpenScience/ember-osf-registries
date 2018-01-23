import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    classNames: ['branded-footer']
});
