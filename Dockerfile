FROM node:latest
WORKDIR /opt/
COPY . .
CMD [ "node", "index.js" ]
