# Docker Hub: https://hub.docker.com/_/node/
FROM node:6.11
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo deb http://dl.google.com/linux/chrome/deb/ stable main > /etc/apt/sources.list.d/google.list'
RUN sed -i '/jessie-updates/d' /etc/apt/sources.list && apt-get -y update && apt-get install -y ruby \
  openjdk-7-jre xvfb xfonts-100dpi \
  xfonts-75dpi xfonts-scalable xfonts-cyrillic \
  xvfb x11-apps imagemagick google-chrome-stable && gem install s3_website && npm install -g nodemon mocha

COPY test/xvfb /etc/init.d/
RUN chmod +x /etc/init.d/xvfb && update-rc.d xvfb defaults

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "npm", "start" ]
