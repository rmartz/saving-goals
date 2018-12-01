[![Travis CI status](https://travis-ci.org/rmartz/saving-goals.svg?branch=develop)](https://travis-ci.org/rmartz/saving-goals)

# Saving Goals
This project aims to help achieve long-term goals by organizing goals in order of priority and earmarking portions of savings contributions towards each goal. Contributions must be entered manually, and disperse across a budget's goals in decreasing proportion so that goals towards the top receive the highest relative proportion of the contribution.

Multiple budgets can also be defined to maintain a parallel list of goals or to maintain independant budgets for certain areas, such as long-term travel goals.

A free-to-use instance is available at https://savings.reedmartz.com. All changes made to `develop` are deployed to there automatically.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Because some errors can fail during compilation but work under development (Such as private component variables used in the component's template), to test the AOT compiler run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
