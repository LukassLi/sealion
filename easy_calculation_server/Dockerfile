FROM node:lts-alpine

WORKDIR /app

COPY . ./
RUN npm install --only=production

RUN node_modules/typescript/bin/tsc -target es5 index.ts

EXPOSE 3000
CMD [ "node", "index.js" ]
