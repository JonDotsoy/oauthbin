FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /data/

VOLUME [ "/data" ]

ENV ASTRO_TELEMETRY_DISABLED=1
ENV ASTRO_DB_REMOTE_URL=file:/data/oauthbin.db

RUN npm run astro db push -- --remote
RUN npm run astro db execute db/seed.ts -- --remote

EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0", "--remote"]

