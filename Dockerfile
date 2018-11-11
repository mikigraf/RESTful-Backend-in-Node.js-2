FROM node:8-slim

WORKDIR /starter
ENV NODE_ENV DEV

COPY package.json /starter/package.json
RUN npm install

COPY .env /starter/.env
COPY . /starter

CMD ["node","app.js"]

EXPOSE 8080