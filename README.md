# UrboCore WWW
URBO's frontend application. This project is the HTML5 application of URBO solution for smart cities.

Status **master** branch: [![Build Status](http://jenkins.geographica.gs/buildStatus/icon?job=UrboCore-www/master)](http://jenkins.geographica.gs/job/UrboCore-www/job/master/)

Status **dev** branch: [![Build Status](http://jenkins.geographica.gs/buildStatus/icon?job=UrboCore-www/dev)](http://jenkins.geographica.gs/job/UrboCore-www/job/dev/)

## Introduction
This is the code repository for URBO Core WWW, the web frontend for the URBO project.

This repository provides the base code for the web frontend and needs to be complemented with pluggable verticals.


## Requirements
* NodeJS version 6.x or greater.
* Docker version 17.06 or greater.
* We recommend using GNU/Linux as server, but is not mandatory.


## Install and run
In order to run this application you will need to install UrboCore WWW along with some pluggable verticals.

### Installing UrboCore WWW
1. Clone this repository
2. Create the config file on `src/js/Config.js` taking `src/js/Config.template.js` as source and fill it.
3. Install node dependencies with npm (or using `yarn` if you prefer)
```
npm install
```
4. Run server using docker-compose
```
docker-compose up www
```
5. Install needed verticals as is explained in the [Managing pluggable verticals](#managing-pluggable-verticals) section.
6. Build the production code as is explained in the [Building production code](#building-production-code) section.

### Managing pluggable verticals

#### Install verticals
To install a new vertical you just need to execute:
```
npm run-script install-vertical -- <vertical-source-path> <vertical-name>
```

Remember to build the production code in order to apply this changes.

#### Update verticals
The same way you can install a new vertical you can update it too executing:
```
npm run-script update-vertical -- <vertical-source-path> <vertical-name>
```

Remember to build the production code in order to apply this changes.


### Building production code
First, create the building container:
```
docker-compose build www_builder
```
Then, just run this container to build the production code:
```
docker-compose up www_builder
```


## Testing
To run the tests, just execute:
```
docker-compose run www_builder npm run-script test
```


## License

UrboCore WWW is licensed under Affero General Public License (GPL) version 3.
