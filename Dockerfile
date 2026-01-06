####################################################################
FROM node:24-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

####################################################################
FROM base AS deps

ENV NODE_ENV=develpment

RUN npm install

####################################################################
FROM base AS builder

COPY --from=deps /app/node_modules /app/node_modules

COPY . .

RUN mkdir -p /data/

VOLUME [ "/data" ]

ENV ASTRO_TELEMETRY_DISABLED=1
ENV ASTRO_DB_REMOTE_URL=file:/data/oauthbin.db
ENV ASTRO_DATABASE_FILE=file:/data/oauthbin.db
ENV HOST=0.0.0.0
ENV PORT=4321

RUN npm run astro db push -- --remote
RUN npm run astro db execute db/seed.ts -- --remote

RUN npm run astro build

####################################################################
FROM base AS prod

ENV ASTRO_TELEMETRY_DISABLED=1
ENV ASTRO_DB_REMOTE_URL=file:/data/oauthbin.db
ENV ASTRO_DATABASE_FILE=file:/data/oauthbin.db
ENV HOST=0.0.0.0
ENV PORT=4321

RUN mkdir -p /data/

COPY package*.json ./

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /data/oauthbin.db /data/oauthbin.db
COPY . .

VOLUME [ "/data" ]

EXPOSE 4321

CMD [ "node", "dist/server/entry.mjs" ]

