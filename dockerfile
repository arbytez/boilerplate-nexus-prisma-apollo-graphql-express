FROM node:12.14.0

RUN mkdir -p /usr/src/app

COPY ./ /usr/src/app/

WORKDIR /usr/src/app/

RUN npm install
RUN npm run prod build
CMD [ "npm", "run", "prod", "start" ]
