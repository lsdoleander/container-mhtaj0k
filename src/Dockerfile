
ROM node:20-alpine

WORKDIR /app/src
COPY . /app/src

RUN npm install

RUN chown -R node:node /app

USER node

RUN node /app/src/data.js init

ENTRYPOINT /app/src/entrypoint.sh
