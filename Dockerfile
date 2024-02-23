FROM node:20.10.0-alpine

RUN mkdir /var/www
WORKDIR /var/www
COPY /app /var/www
#COPY app/package.json /var/www/package.json
RUN npm i
RUN npm install -g nodemon