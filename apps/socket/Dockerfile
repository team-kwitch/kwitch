FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install turbo --global

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @kwitch/socket --docker

FROM base AS installer
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y build-essential python3 python3-pip

WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install

COPY --from=builder /app/out/full/ .
RUN turbo build --filter=@kwitch/socket...

FROM base AS runner
WORKDIR /app

USER node
COPY --from=installer --chown=node:node /app .

ENTRYPOINT [ "pnpm --filter=socket start" ]