FROM node:12.14.0

RUN mkdir -p /usr/src/app

COPY ./ /usr/src/app/

WORKDIR /usr/src/app/

RUN npm i -g pm2

RUN npm i
RUN npm run prod build

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
