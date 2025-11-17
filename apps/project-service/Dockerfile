# Build stage - compile TypeScript and generate artifacts
FROM node:lts-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache protobuf-dev

# Install pnpm
RUN npm install -g pnpm

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including dev) for building
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and proto files
RUN mkdir -p libs/common/src/generated
RUN cd apps/project-service && npx prisma generate
RUN npm run proto:generate || echo "Proto generation failed - some proto files may be missing"

# Build the application
RUN pnpm run build project-service

# Development stage
FROM node:lts-alpine AS development

WORKDIR /app

# Install protoc for development
RUN apk add --no-cache protobuf-dev

USER root

EXPOSE 50055

# Production stage - minimal and optimized
FROM node:lts-alpine AS production

WORKDIR /app

# Install only runtime dependencies (keep openssl for Prisma)
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and prisma globally to avoid npx auto-install issues
RUN npm install -g pnpm prisma@6.16.2

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema
COPY --from=builder /app/apps/project-service/prisma ./apps/project-service/prisma

# Generate Prisma client for production using globally installed prisma
RUN prisma generate --schema=./apps/project-service/prisma/schema.prisma

# Uninstall pnpm after all installations (keep prisma for migrations)
RUN npm uninstall -g pnpm

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy proto files (needed at runtime for gRPC)
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 50055

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50055}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

# Use dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/apps/project-service/main"]
