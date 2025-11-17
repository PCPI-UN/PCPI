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
RUN pnpm run build gateway

# Development stage
FROM node:lts-alpine AS development

WORKDIR /app

# Install protoc for development
RUN apk add --no-cache protobuf-dev

USER root

EXPOSE 3000

# Production stage - minimal and optimized
FROM node:lts-alpine AS production

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache dumb-init wget

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

EXPOSE 50050

# Health check for HTTP endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:50050/health || exit 1

# Use dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/apps/gateway/main"]
