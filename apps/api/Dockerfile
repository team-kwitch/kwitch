FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_HOME="/app/.cache/corepack"
RUN corepack enable

RUN apt update
RUN apt install -y \
  python3-pip \
  build-essential 

FROM base AS builder
# Set working directory
WORKDIR /app
# Replace <your-major-version> with the major version installed in your repository. For example:
# RUN npm install -g turbo@^2
RUN pnpm add -g turbo@2.5.2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune @kwitch/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build

FROM base AS runner
WORKDIR /app

# Create nodejs user and group
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nodejs && \
  mkdir -p /app/.cache/corepack && \
  chown -R nodejs:nodejs /app

# Copy files with proper ownership
COPY --from=installer --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /app/packages/ ./packages/
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist

USER nodejs
WORKDIR /app/apps/api
CMD ["pnpm", "start:prod"]