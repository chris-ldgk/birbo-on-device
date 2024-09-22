FROM node:22-bookworm-slim AS node
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    python3 \
    build-essential \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

FROM node AS installer
WORKDIR /opt/app/installer
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node AS production
WORKDIR /opt/app/prod
COPY . .
COPY --from=installer /opt/app/installer/node_modules ./node_modules

CMD ["node", "--experimental-strip-types", "--experimental-specifier-resolution=node", "index.ts"]