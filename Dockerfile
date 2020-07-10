FROM node:12

WORKDIR /app

COPY . /app

RUN npm install \
    && npm run build

ENTRYPOINT ["npm", "run", "start"]