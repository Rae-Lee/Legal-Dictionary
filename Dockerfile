FROM node:18-alpine
WORKDIR /app
COPY ./package.json ./package-lock.json /app/
RUN npm install && npm cache clean --force
COPY . /app
RUN set NODE_ENV=development && npm run start