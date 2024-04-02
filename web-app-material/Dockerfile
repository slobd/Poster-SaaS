FROM node:14

WORKDIR /app

COPY package.json .

COPY yarn.lock .

COPY .npmrc .

ARG NODE_ENV=development

ENV NODE_ENV=${NODE_ENV}

RUN yarn install

COPY . .

ENV HOST=0.0.0.0

ENV PORT=3000

EXPOSE 3000

CMD [ "yarn", "dev" ]