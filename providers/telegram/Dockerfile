FROM node:12

# Create app directory
RUN mkdir -p /usr/src/app/media
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

RUN npm install

WORKDIR /usr/src/app
CMD [ "npm", "start" ]
