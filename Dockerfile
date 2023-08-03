FROM node:18-alpine as development

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node prisma ./prisma/

RUN npm ci

RUN npm run build

FROM node:18-alpine as production

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node --from=development /app/prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

RUN npx prisma generate

COPY --chown=node:node --from=development /app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "start:migrate:prod" ]
