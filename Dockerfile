FROM node:9.11
MAINTAINER "Jorge Baumann - @baumannzone"

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN npm install -g swagger
RUN npm rebuild
RUN npm install
