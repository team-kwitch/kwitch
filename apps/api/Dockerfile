FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install turbo --global

RUN apt-get update -y && \ 
    apt-get install -y openssl

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @kwitch/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install

COPY --from=builder /app/out/full/ .
RUN turbo build --filter=@kwitch/api...

FROM base AS runner
WORKDIR /app

USER node
COPY --from=installer --chown=node:node /app/ .

ENV NODE_ENV=production

ENTRYPOINT ["pnpm", "--filter=@kwitch/api", "start"]
