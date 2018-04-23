#!/bin/sh
docker-compose run -v /route/to/vertical:/route/to/vertical -p 8085:80 --rm www > /dev/null &
docker-compose run -v /route/to/vertical:/route/to/vertical:/route/to/vertical:/route/to/vertical --rm www_builder