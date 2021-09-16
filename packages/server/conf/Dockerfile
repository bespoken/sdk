FROM node:10

EXPOSE 3000 443

WORKDIR /opt

RUN mkdir batch-tester

WORKDIR /opt/batch-tester

COPY src/ ./src/

COPY server/ ./server/

COPY *.json ./

RUN npm install

RUN chmod 755 server/server.js