FROM node

RUN apt-get update && apt-get install -y vim
RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json .
COPY yarn.lock .

RUN yarn install
RUN yarn add -D nodemon

COPY . .

CMD ["./node_modules/.bin/nodemon", "index.ts"]