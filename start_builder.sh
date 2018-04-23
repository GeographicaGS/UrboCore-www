#!/bin/sh
docker-compose run -v /home/daniel/projects/AquaGIS:/home/daniel/projects/AquaGIS -p 80:80 --rm www > /dev/null &
docker-compose run -v /home/daniel/projects/AquaGIS:/home/daniel/projects/AquaGIS --rm www_builder
docker-compose down