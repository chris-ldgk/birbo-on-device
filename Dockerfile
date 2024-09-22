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

ENV LD_LIBRARY_PATH=/opt/vc/lib
ENV SUPABASE_URL=
ENV SUPABASE_KEY=

ENV TRIGGER_DISTANCE=10
ENV TRIGGER_CHECK_INTERVAL=2500

ENV VIDEO_RECORDING_DURATION=5000
ENV VIDEO_FRAMERATE=30
ENV VIDEO_WIDTH=1280
ENV VIDEO_HEIGHT=720

ENV GPIO_TRIGGER_PIN=526
ENV GPIO_ECHO_PIN=527

CMD ["node", "--experimental-strip-types", "--experimental-specifier-resolution=node", "index.ts"]