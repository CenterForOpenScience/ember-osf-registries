import { moduleFor, test } from 'ember-qunit';

moduleFor('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    needs: [
        'service:i18n',
        'service:metrics',
        'service:session',
        'service:theme',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
