# Build stage - compile TypeScript and generate artifacts
FROM node:lts-alpine AS builder
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p libs/common/src/generated && \
  cd apps/auth-service && npx prisma generate && cd ../.. && \
  npm run proto:generate || echo "Proto generation failed - some proto files may be missing" && \
  pnpm run build auth-service && \
  npx tsc apps/auth-service/prisma/seed.ts \
  --outDir dist/apps/auth-service/prisma \
  --esModuleInterop --resolveJsonModule \
  --skipLibCheck --module commonjs --target es2020

# Development stage - self-contained with all dev tools
FROM node:lts-alpine AS development
WORKDIR /app

RUN apk add --no-cache protobuf-dev && \
  npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/auth-service/prisma ./dist/apps/auth-service/prisma

USER root
EXPOSE 50051

# Production stage - minimal and optimized
FROM node:lts-alpine AS production
WORKDIR /app

ENV HUSKY=0

RUN apk add --no-cache dumb-init openssl && \
  npm install -g pnpm prisma@6.16.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/auth-service/prisma/schema.prisma ./apps/auth-service/prisma/schema.prisma
COPY --from=builder /app/apps/auth-service/prisma/migrations ./apps/auth-service/prisma/migrations

RUN prisma generate --schema=./apps/auth-service/prisma/schema.prisma && \
  npm uninstall -g pnpm && \
  addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 && \
  chown -R nestjs:nodejs /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

USER nestjs
EXPOSE 50051

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50051}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["dumb-init", "node", "dist/apps/auth-service/main"]
