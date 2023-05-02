FROM node:18-alpine
WORKDIR /app
COPY ./package.json ./package-lock.json /app/
RUN npm install && npm cache clean --force
COPY . /app
CMD ["npm","run","start"]