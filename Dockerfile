FROM node:latest
COPY . /app/
WORKDIR /app
RUN npm install && npm cache clean --force
CMD [ "node", "app.js" ]
EXPOSE 3000