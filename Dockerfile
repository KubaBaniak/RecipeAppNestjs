FROM node:18-alpine as builder

WORKDIR /app

COPY src ./src
COPY prisma ./prisma/
COPY nest-cli.json .swcrc package*.json tsconfig*.json ./


RUN npm ci

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine as app

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN rm dist/*.map

EXPOSE 3000

USER node

CMD [ "npm", "run", "start:migrate:prod" ]
