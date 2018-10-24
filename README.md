# UrboCore WWW
URBO's frontend application. This project is the HTML5 application of URBO solution for smart cities.

| Master | Dev |
|--------|-----|
|[![Build Status](https://jenkins.geographica.gs/buildStatus/icon?job=UrboCore-www/master)](https://jenkins.geographica.gs/job/UrboCore-www/job/master/)|[![Build Status](https://jenkins.geographica.gs/buildStatus/icon?job=UrboCore-www/dev)](https://jenkins.geographica.gs/job/UrboCore-www/job/dev/)|

## Introduction
This is the code repository for URBO Core WWW, the web frontend for the URBO project.

This repository provides the base code for the web frontend and needs to be complemented with pluggable verticals.


## Requirements
* NodeJS version 6.x or greater.
* Docker version 18.02 or greater.
* We recommend using GNU/Linux as server, but is not mandatory.

## Notes for developers
The development configurations for the different containers required by the API are defined in the *docker-compose.override.yml* file. By default, docker-compose will override/merge the configuration existing in the *docker-compose.yml* file with the contents of the *.override.yml* file. This means that when you execute `docker-compose up` you will start the development environment by default. You can find more information about how docker-compose allows you to extend configurations [here](https://docs.docker.com/compose/extends/).

If you wish to change/update the configurations you can create a new _docker-compose.*.yml_ file, that file will be ignored by default by git, so you can create as many configurations as you wish.
In order to use these configs you will have to append to your docker-compose commands two `-f` flags. For example:
```
docker-compose -f docker-compose.yml -f docker-compose.example.yml up -d
```
This leads to more difficult to read commands, our recommendation is to create an alias in your shell, let's call it `dcp`:
```
alias dcp="docker-compose -f docker-compose.yml -f docker-compose.example.yml"
```
With this alias you can issue commands faster, the previous example ends up like this:
```
dcp up -d
```
Remember that you can still use other docker-compose commands with this shortcut: `dcp build`, `dcp down` ...

## Install and run
In order to run this application you will need to install UrboCore WWW along with some pluggable verticals.

### Installing UrboCore WWW
1. Clone this repository
2. Create the config file on `src/js/Config.js` taking `src/js/Config.template.js` as source and fill it.
3. (Optional) Install node dependencies with npm (or using `yarn` if you prefer). _This step is only required if you wish to develop in a local environment._
```
npm install
```
4. Install needed verticals as is explained in the [Managing pluggable verticals](#managing-pluggable-verticals) section.
5. Build the production code as is explained in the [Building production code](#building-production-code) section.
6. Run server using docker-compose
```
docker-compose up www
```

### Managing pluggable verticals
In order to execute the npm commands described below you will need the `fs-extra` package installed in your Node environment. Another option is to copy manually the `www` folders located inside the vertical folders. You could also use docker volumes and mount the necessary verticals by modifying the volumes section in the `docker-compose.yml` file.

#### Install verticals
To install a new vertical you just need to execute:
```
npm run-script install-vertical -- <vertical-source-path> <vertical-name>
```

Remember to build the production code in order to apply any changes.

#### Update verticals
The same way you can install a new vertical you can update it too executing:
```
npm run-script update-vertical -- <vertical-source-path> <vertical-name>
```

Remember to build the production code in order to apply any changes.


### Building production code
#### Production mode
First, create the building container. Check that you installed the necessary verticals first:
```
docker-compose build --build-arg NODE_ENV=production www_builder
```
Then, just run this container to build the production code:
```
docker-compose run www_builder npm run-script start
```
#### Development mode
In this mode the `www_builder` container acts as a daemon, if any change is made to the code a rebuild action will be triggered. The changes will be automatically propagated to the files served by nginx (using the Docker volumes configured in the containers). You just need to run the following commands:
```
# Remember that by default docker-compose will use development configurations
docker-compose build  # Build the image in development mode
docker-compose up     # Start the builder container and the nginx container
```


## Testing
To run the tests, just execute:
```
docker-compose run www_builder npm run-script test
```


## License

UrboCore WWW is licensed under Affero General Public License (GPL) version 3.
