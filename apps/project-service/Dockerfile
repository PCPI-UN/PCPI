FROM node:lts-alpine AS base

WORKDIR /app

# Install protoc (Protocol Buffers compiler)
RUN apk add --no-cache protobuf-dev

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN cd apps/project-service && npx prisma generate
RUN npm run proto:generate || echo "Proto generation failed - some proto files may be missing"
RUN pnpm run build project-service

FROM node:lts-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=base /app/dist ./dist
COPY --from=base /app/libs ./libs
COPY --from=base /app/apps/project-service/prisma ./apps/project-service/prisma
COPY --from=base /app/node_modules/.pnpm ./node_modules/.pnpm

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 50055

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:50055}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["node", "dist/apps/project-service/main"]
