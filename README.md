# Library Registry Administrative Interface

[![Test](https://github.com/ThePalaceProject/library-registry-admin/actions/workflows/test.yml/badge.svg)](https://github.com/ThePalaceProject/library-registry-admin/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/%40thepalaceproject%2Flibrary-registry-admin.svg)](https://badge.fury.io/js/%40thepalaceproject%2Flibrary-registry-admin)
[![Deploy Documentation](https://github.com/ThePalaceProject/library-registry-admin/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/ThePalaceProject/library-registry-admin/actions/workflows/gh-pages.yml)

This is a [LYRASIS](http://lyrasis.org)-maintained fork of the NYPL [Library Simplified](http://www.librarysimplified.org/) Library Registry administrative interface.

## Library Simplified Documentation

To see screenshots, read in-depth documentation, and find out more about the project, check out the [Confluence](https://confluence.nypl.org/display/SIM/) site hosted by The New York Public Library.

## Setup

This package is meant to be used with The Palace Project [Library Registry](https://github.com/thepalaceproject/library-registry).

Node.js version 18 is required to build and run the administrative interface.

### Cloning this repository

Suggested local folder setup:
- `/[path to project folder]/library-registry`
- `/[path to project folder]/library-registry-admin`

### Running with a remote registry server

If you're working on the administrative interface and want to test local changes against a remote library registry, you can run the administrative interface using the command:

```
npm run dev-server -- --env=backend=[url]
```

For example, `npm run dev-server -- --env=backend=https://registry-tpp-qa.palaceproject.io`. The admin UI can then be accessed at `http://localhost:8080/admin/`.

This works by running a local proxy server. HTML pages received from the Library Registry that load assets from the `library-registry-admin` package on jsdelivr are rewritten to load them from the local webpack build instead.

Webpack will take care of compiling and updating any new changes made locally for development. Hot module replacement and live reloading are enabled, so the browser will automatically update as changes are made.

### Running with a local registry server

If you're working on the administrative interface and want to test local changes against a local library registry, you can link your local clone of this repository to your local library registry. These steps will allow you to work on the front-end administrative interface and see updates while developing.

1. Run `npm link` in this `library-registry-admin` repository,
2. run `npm link library-registry-admin` from the `library-registry` repository,
2. run the library registry using `python app.py` at the root in the `library-registry` repository,
3. run the web interface using `npm run dev` at the root of this `library-registry-admin` repository,
4. visit `localhost:7000/admin/`

Webpack will take care of compiling and updating any new changes made locally for development. Just refresh the page to see updates without having to restart either the `library-registry` or `library-registry-admin` servers.

## Publishing

<!-- This package is [published to npm](https://www.npmjs.com/package/@thepalaceproject/library-registry-admin). -->

We use GitHub Actions for publishing. This package is published automatically when a new release is created.

## Accessibility

In order to develop user interfaces that are accessible to everyone, there are tools added to the workflow. Besides the Typescript `tslint-react-a11y` plugin, `react-axe` is also installed for local development. Using that module while running the app uses a lot of resources so it should be only when specifically testing for accessibility and not while actively developing new features or fixing bugs.

In order to run the app with `react-axe`, run `npm run dev-test-axe`. This will add a local global variable `process.env.TEST_AXE` (through webpack) that will trigger `react-axe` in `/src/index.tsx`. The output will be seen in the _browser's_ console terminal.

## Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions, and all can be found in their respective `__tests__` folders.

To run the tests, perform `npm test`.

We use GitHub Actions for continuous integration. Any pull requests submitted must have tests and those tests must pass during the CI checks.

## License

```
Copyright © 2015 The New York Public Library, Astor, Lenox, and Tilden Foundations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
