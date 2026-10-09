# The app image for ECS Fargate (infra/, DECISIONS 107). Next.js runs on
# Node (as it does locally: bun run launches the Next CLI with Node); bun
# installs packages and runs the jobs (`bun run job <name>`). Built for
# linux/arm64 in CI.

FROM oven/bun:1.2.23-slim AS bun

FROM node:24.21.0-slim AS base
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS run
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Amazon RDS certificate bundle, so Postgres TLS is verified (lib/db/postgres.ts).
# The directory is made first: ADD would create it without the execute bit.
RUN mkdir -p -m 755 /etc/ssl/rds
ADD --chmod=644 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /etc/ssl/rds/global-bundle.pem
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY package.json bun.lock next.config.ts tsconfig.json ./
COPY public ./public
COPY drizzle ./drizzle
COPY fixtures ./fixtures
COPY lib ./lib
COPY jobs ./jobs
COPY scripts ./scripts
# The node user is uid 1000, matching the task definition.
USER node
EXPOSE 3000
CMD ["bun", "run", "start"]
