/* eslint-env node */

module.exports = function(environment) {
    const authorizationType = 'cookie';

    const ENV = {
        modulePrefix: 'registries-service',
        appName: 'Registries',
        environment,
        rootURL: '/',
        locationType: 'auto',
        authorizationType,
        sentryDSN: 'http://test@localhost/80' || process.env.SENTRY_DSN,
        sentryOptions: {
            release: process.env.GIT_COMMIT,
        },
        'ember-simple-auth': {
            authorizer: `authorizer:osf-${authorizationType}`,
            authenticator: `authenticator:osf-${authorizationType}`,
        },
        useSHAREData: !!process.env.USE_SHARE_DATA,
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            },
        },
        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
        },
        SHARE: {
            baseUrl: process.env.SHARE_BASE_URL || 'https://share.osf.io/',
            searchUrl: process.env.SHARE_SEARCH_URL || 'https://share.osf.io/api/v2/search/creativeworks/_search',
        },
        moment: {
            outputFormat: 'YYYY-MM-DD hh:mm a',
        },
        REGISTRIES: {
            defaultProvider: 'osf',

            // Logos are needed for open graph sharing meta tags
            // (Facebook, LinkedIn, etc) and must be at least 200x200
            providers: [
                {
                    id: 'osf',
                    logoSharing: {
                        path: '/assets/img/provider_logos/osf-dark.png',
                        type: 'image/png',
                        width: 363,
                        height: 242,
                    },
                },
            ],
        },
        i18n: {
            defaultLocale: 'en',
        },
        metricsAdapters: [
            {
                name: 'GoogleAnalytics',
                environments: [process.env.KEEN_ENVIRONMENT] || ['production'],
                config: {
                    id: process.env.GOOGLE_ANALYTICS_ID,
                    setFields: {
                        // Ensure the IP address of the sender will be anonymized.
                        anonymizeIp: true,
                    },
                },
                dimensions: {
                    authenticated: 'dimension1',
                    resource: 'dimension2',
                    isPublic: 'dimension3',
                },
            },
            {
                name: 'Keen',
                environments: [process.env.KEEN_ENVIRONMENT] || ['production'],
                config: {
                    private: {
                        projectId: process.env.REGISTRIES_PRIVATE_PROJECT_ID,
                        writeKey: process.env.REGISTRIES_PRIVATE_WRITE_KEY,
                    },
                    public: {
                        projectId: process.env.REGISTRIES_PUBLIC_PROJECT_ID,
                        writeKey: process.env.REGISTRIES_PUBLIC_WRITE_KEY,
                    },
                },
            },
        ],
        FB_APP_ID: process.env.FB_APP_ID,
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;

        ENV.metricsAdapters[0].config.cookieDomain = 'none';
    }

    if (environment === 'test') {
        // Testem prefers this...
        // ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';

        // Don't make external requests during unit test
        // TODO: Provide mocks for all components with manual AJAX calls in the future.
        ENV.SHARE.baseUrl = '/nowhere';
        ENV.SHARE.searchUrl = '/nowhere';
        ENV.OSF = {};
        ENV.OSF.shareSearchUrl = '/nowhere';

        ENV.metricsAdapters[0].config.cookieDomain = 'none';
    }

    if (environment === 'production') {
        ENV.sentryDSN = process.env.SENTRY_DSN || 'https://2f0a61d03b99480ea11e259edec18bd9@sentry.cos.io/45';
        ENV.ASSET_SUFFIX = process.env.GIT_COMMIT || 'git_commit_env_not_set';
    }

    if (ENV.ASSET_SUFFIX) {
        ENV.REGISTRIES.providers = ENV.REGISTRIES.providers.map((provider) => {
            const mappedProvider = provider;
            mappedProvider.logoSharing.path = provider.logoSharing.path
                .replace(/\..*$/, match => `-${ENV.ASSET_SUFFIX}${match}`);
            return mappedProvider;
        });
    }

    return ENV;
};
