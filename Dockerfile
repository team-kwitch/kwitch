FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG WEB_APP=web
ARG API_APP=api
ARG SOCKET_APP=socket

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update -y \
    && apt-get install -y openssl

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm deploy --filter=$WEB_APP --prod /prod/$WEB_APP
RUN pnpm deploy --filter=$API_APP --prod /prod/$API_APP
RUN pnpm deploy --filter=$SOCKET_APP --prod /prod/$SOCKET_APP

FROM base AS web
COPY --from=build /prod/$WEB_APP /prod/$WEB_APP
WORKDIR /prod/$WEB_APP
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS api
COPY --from=build /prod/$API_APP /prod/$API_APP
WORKDIR /prod/$API_APP
EXPOSE 8000
CMD [ "pnpm", "start" ]

FROM base AS socket
COPY --from=build /prod/$SOCKET_APP /prod/$SOCKET_APP
WORKDIR /prod/$SOCKET_APP
EXPOSE 8001
CMD [ "pnpm", "start" ]