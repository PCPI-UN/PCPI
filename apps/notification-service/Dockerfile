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

# Generate proto files
RUN mkdir -p libs/common/src/generated
RUN npm run proto:generate || echo "Proto generation failed - some proto files may be missing"

# Build the application
RUN pnpm run build notification-service

# Development stage - self-contained with all dev tools
FROM node:lts-alpine AS development

WORKDIR /app

# Install development dependencies and tools
RUN apk add --no-cache protobuf-dev

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy built node_modules from builder (includes all dev dependencies)
COPY --from=builder /app/node_modules ./node_modules

USER root

EXPOSE 50056

# Production stage - minimal and optimized
FROM node:lts-alpine AS production

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm temporarily for production install
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile && \
    npm uninstall -g pnpm

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy proto files (needed at runtime for gRPC)
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 50056

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50056}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

# Use dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/apps/notification-service/main"]
