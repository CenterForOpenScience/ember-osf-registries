# ember-osf-registries

`master` Build Status: [![Build Status](https://travis-ci.org/CenterForOpenScience/ember-osf-registries.svg?branch=master)](https://travis-ci.org/CenterForOpenScience/ember-osf-registries)

`develop` Build Status: [![Build Status](https://travis-ci.org/CenterForOpenScience/ember-osf-registries.svg?branch=develop)](https://travis-ci.org/CenterForOpenScience/ember-osf-registries)

This is the codebase for OSF Registries.
This guide will help you get started if you're interested.

## Prerequisites

You will need the following dependencies properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (preferably via [nvm](https://github.com/creationix/nvm#install-script))
* [Yarn](https://yarnpkg.com/)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone` this repository
* `yarn install --pure-lockfile`
* `bower install`

## Running / Development
For local development, this is designed to run alongside (and from within) the flask application for osf.io.


1. Start your Ember server: `ember serve`
2. Add this to to your `website/settings/local.py` file:
```
'registries': {
    'url': '/registries/',
    'server': 'http://localhost:4200',
    'path': '../ember-osf-registries/dist/'
}
```
3. Visit your app at http://localhost:5000/registries/

If you encounter problems, make sure that your version of ember-osf is up to date. If login fails, try logging in from
any other OSF page, then returning to the preprints app.

### Generating test data on the OSF
This interacts only with the SHARE data available. Unless SHARE needs to be configured locally, pointing config/environment.js to one of SHARE servers (such as https://share.osf.io/) should populate the app with data.

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests
You can run tests either with ember installed on your machine or by using [Docker](https://docs.docker.com/engine/getstarted/step_one/)

#### On your local machine
* `ember test`
* `ember test --server`

#### With Docker
* `docker build --tag registries .`
* `docker run registries`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

## Further Reading / Useful Links

* [Requirements and road map for this service](https://docs.google.com/a/cos.io/document/d/1utn2oYxyQ_tsS7XGv1uSsR_DaJabWRLneLG4mVRTIcc/)
* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
