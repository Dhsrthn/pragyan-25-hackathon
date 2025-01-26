# Use the official Node.js image as the base image
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .

CMD ["npm", "start"]