# Build stage - compile TypeScript and generate artifacts
FROM node:lts-alpine AS builder
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p libs/common/src/generated && \
  npm run proto:generate || echo "Proto generation failed - some proto files may be missing" && \
  pnpm run build gateway

# Development stage - self-contained with all dev tools
FROM node:lts-alpine AS development
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

USER root
EXPOSE 3000

# Production stage - minimal and optimized
FROM node:lts-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init wget && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN npm pkg delete scripts.prepare && \
    pnpm install --prod --frozen-lockfile

RUN npm uninstall -g pnpm && \
  addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 && \
  chown -R nestjs:nodejs /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["dumb-init", "node", "dist/apps/gateway/main"]
