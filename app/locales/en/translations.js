const registries = `Registries`
const brand = `OSF ${registries}`;

export default {
    global: {
        share: `Share`,
        complete: `Complete`,
        cancel: `Cancel`,
        discard: `Discard changes`,
        back: `Back`,
        prev: `Prev`,
        next: `Next`,
        none: `None`,
        abstract: `Abstract`,
        doi: `DOI`,
        tags: `Tags`,
        search: `Search`,
        brand,
        brand_name: 'OSF',
        provider_brand: `{{name}} ${registries}`,
        title: `Title`,
        search_registries: `Search registrations...`,
        added_on: `Added on`,
        add: `Add`,
        restart: `Restart`,
        no_results_found: `No results found.`,
        authors: `Authors`,
        open_science_framework: `Open Science Framework`,
        license: 'License',
    },
    application: {
        // Nothing to translate
    },
    discover: {
        search: {
            heading: `Registration Archive Search`,
            paragraph: `powered by`,
            partner: `Partner Repositories`,
            placeholder: `Search registrations...`
        },
        sort_by: `Sort by`,
        main: {
            active_filters: {
                heading: `Active Filters`,
                button: `Clear filters`
            },
            refine: `Refine your search by`,
            providers: `Providers`,
            type: 'OSF Registration Type',
            subject: `Subject`,
            results: {
                of: `of`,
                no_results: `Try broadening your search terms`
            },
            otherRepositories: `Other registraation repositories`,
        }
    },
    index: {
        header: {
            title: {
                paragraph: `The <span class="f-w-lg">open</span> registries network`
            },
            powered_by: `Powered by ${brand}`,
            search: `{{count}} searchable registrations`,
            as_of: `as of`,
            example: `See an example`
        },
        subjects: {
            heading: `Browse <small>by subject</small>`
        },
        services: {
            top: {
                heading: `Registry Services`,
                paragraph: `Leading registry service providers use this open source infrastructure to support their communities.`
            },
            bottom: {
                p1: `Create your own branded registry backed by the OSF.`,
                div: {
                    line1: `Check out the`,
                    linkText1: `open source code`,
                    line2: `and the`,
                    linkText2: `requirements and road map`,
                    line3: `. Input welcome!`
                },
                contact: `Contact us`
            }
        },
        advisory: {
            heading: `Advisory Group`,
            paragraph: `Our advisory group includes leaders in registrations across disciplines`
        },
        recent: {
            title: `Browse Recent Registrations`,
            more: `See more`
        },
    },
    'page-not-found': {
        heading: `Page not found`,
        paragraph: {
            line1: `The page you were looking for is not found on the {{brand}} service.`,
            line2: `If this should not have occurred and the issue persists, please report it to`
        },
        go_to: `Go to {{brand}}`
    },
    'page-forbidden': {
        heading: `Forbidden`,
        paragraph: {
            line1: `User has restricted access to this page. If this should not have occurred and the issue persists, please report it to `,
        },
        go_to: `Go to {{brand}}`
    },
    'resource-deleted': {
        heading: `Resource deleted`,
        paragraph: {
            line1: `User has deleted this content. If this should not have occurred and the issue persists, please report it to  `,
        },
        go_to: `Go to {{brand}}`
    },
    components: {
        'preprint-footer-branded': {
            twitter: 'Twitter',
            facebook: 'Facebook',
            instagram: 'Instagram',
            support: `Support`,
            contact: `Contact`
        },
        'preprint-navbar': {
            toggle: `Toggle navigation`
        },
        'preprint-navbar-branded': {
            my_projects: `My OSF Projects`,
            headline: `On the OSF`,
        },
        'search-registries': {
            // Nothing to translate
        },
        'search-result': {
            // Nothing to translate
        },
    }
};
