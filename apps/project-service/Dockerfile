# Build stage - compile TypeScript and generate artifacts
FROM node:lts-alpine AS builder
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm pkg delete scripts.prepare && \
  pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p libs/common/src/generated && \
  cd apps/project-service && npx prisma generate && cd ../.. && \
  npm run proto:generate || echo "Proto generation failed - some proto files may be missing" && \
  pnpm run build project-service

# Development stage - self-contained with all dev tools
FROM node:lts-alpine AS development
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

USER root
EXPOSE 50055

# Production stage - minimal and optimized
FROM node:lts-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init openssl && \
  npm install -g pnpm prisma@6.16.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm pkg delete scripts.prepare && \
  pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/project-service/prisma ./apps/project-service/prisma

RUN prisma generate --schema=./apps/project-service/prisma/schema.prisma && \
  npm uninstall -g pnpm && \
  addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 && \
  chown -R nestjs:nodejs /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

USER nestjs
EXPOSE 50055

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50055}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["dumb-init", "node", "dist/apps/project-service/main"]