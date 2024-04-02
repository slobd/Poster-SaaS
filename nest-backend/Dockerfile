FROM node:14

WORKDIR /app

COPY package.json .

COPY yarn.lock .

COPY jitsi_key.pk .

ARG NODE_ENV=development

ENV NODE_ENV=${NODE_ENV}

RUN yarn install

COPY . .

EXPOSE 2828

CMD [ "yarn", "start:dev" ]