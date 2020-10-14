FROM node:14

RUN npm i -g pm2

RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:compress true

RUN mkdir -p /usr/src/app
COPY ./ /usr/src/app/
WORKDIR /usr/src/app/

RUN npm i
RUN npm run prod build

#RUN npm run prod prisma.migrate.up

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
USER node
