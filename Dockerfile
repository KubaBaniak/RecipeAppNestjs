FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY prisma ./prisma/

RUN npm ci

RUN npm run build

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
