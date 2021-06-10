FROM node:16
WORKDIR /usr/src/app

RUN npm install -g nodemon
RUN npm install -g ganache-cli

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5000
EXPOSE 3000
EXPOSE 8545
CMD ["./.dockerscripts/startup.sh"]