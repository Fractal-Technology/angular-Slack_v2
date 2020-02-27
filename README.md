
###Slack Clone version 2 + uses websockets typescript, docker, docker compose 
## Description

Allows scheduling of conference event and auth of users tied to a firebase backend


## Technology
Front End:

Angular-

Back-End:


Installation
Make sure you have a MongoDB server running locally on port 2017 (or change the mongodb.url in config/default.yml).

Type the following commands:

`npm install`

`npm run db:seed` optional: generates sample data (servers + users + channels)

`npm start` (starts the front-end app)

`npm start:server:dev` (Must be running alongside the frontend)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Run `docker build -t imagename .` to build docker image (production only)

## Running unit tests

Run `npm test` to execute the unit tests (front & back-end)

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).



## Deploying

Run `docker-compose pull` to pull latest image (currently image is private)
Run `docker-compose up` to launch the app in production (only I can do this)

## Stay in touch

- Author - [KoDe ] (https://github.com/elitekode2) github.com/fractal-technology
- kochan@ftnow.us
- Website -  ftnow.us
 