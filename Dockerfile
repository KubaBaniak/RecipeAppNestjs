FROM node:18-alpine as builder

RUN apk add --no-cache curl git bash

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src
COPY prisma ./prisma/
COPY upload-source-maps.sh ./upload-source-maps.sh

RUN npm ci
RUN npm run build
RUN sh upload-source-maps.sh
RUN rm -rf .git
RUN rm dist/*.map

FROM node:18-alpine as app

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

CMD [ "npm", "run", "start:migrate:prod" ]
