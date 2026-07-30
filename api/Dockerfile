# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json yarn.lock tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN yarn prisma generate && yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 atlas

COPY --from=builder --chown=atlas:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=atlas:nodejs /app/dist ./dist
COPY --from=builder --chown=atlas:nodejs /app/prisma ./prisma
COPY --from=builder --chown=atlas:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --chown=atlas:nodejs package.json ./

USER atlas
EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
