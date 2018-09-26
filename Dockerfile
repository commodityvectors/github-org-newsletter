FROM node:8.12-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js ./

RUN npm install

CMD ["node", "index.js"]