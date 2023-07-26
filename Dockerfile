FROM node:18.16.0-alpine as development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY /prisma ./prisma/

RUN npm ci

RUN npx prisma generate

RUN npm run build

FROM node:18.16.0-alpine as production

COPY package*.json ./
COPY tsconfig*.json ./
COPY --from=development /app/prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

RUN npx prisma generate

COPY --from=development /app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "start:migrate:prod" ]
