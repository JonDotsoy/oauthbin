FROM oven/bun

WORKDIR /app

COPY . /app

RUN bun install

ENV HOST=0.0.0.0

EXPOSE 4321

CMD bunx --bun astro dev --host=0.0.0.0
# CMD [ "bunx", "--bun", "astro", "dev", "--host=${HOST}", "--port=4321" ]
