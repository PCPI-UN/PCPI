# =========================
# Build stage
# =========================
FROM node:lts-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema + pnpm en una sola capa
RUN apk add --no-cache protobuf-dev \
    && npm install -g pnpm

# Copiar manifests primero (mejor cache)
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (incluye dev)
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Generar artefactos y build en un solo RUN
RUN mkdir -p libs/common/src/generated \
    && cd apps/evaluation-service && npx prisma generate && cd ../.. \
    && npm run proto:generate || echo "Proto generation failed - some proto files may be missing" \
    && pnpm run build evaluation-service


# =========================
# Production stage
# =========================
FROM node:lts-alpine AS production

WORKDIR /app

# Instalar runtime deps + herramientas necesarias en una capa
RUN apk add --no-cache dumb-init openssl \
    && npm install -g pnpm prisma@6.16.2

# Copiar manifests
COPY package.json pnpm-lock.yaml ./

# Instalar solo prod deps
RUN pnpm install --prod --frozen-lockfile \
    && npm uninstall -g pnpm

# Copiar Prisma schema
COPY --from=builder /app/apps/evaluation-service/prisma ./apps/evaluation-service/prisma

# Generar cliente Prisma
RUN prisma generate --schema=./apps/evaluation-service/prisma/schema.prisma

# Copiar build y assets necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs/common/src/protos ./libs/common/src/protos

# Crear usuario no-root en una sola capa
RUN addgroup -S nodejs -g 1001 \
    && adduser -S nestjs -u 1001 \
    && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 50052

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50052}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["dumb-init", "node", "dist/apps/evaluation-service/main"]
