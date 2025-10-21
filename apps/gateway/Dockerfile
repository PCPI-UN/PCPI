FROM node:lts-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npm run proto:generate || echo "Proto generation failed - some proto files may be missing"
RUN pnpm run build gateway

FROM base AS development

WORKDIR /app

USER root

EXPOSE 3000

FROM node:lts-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=base /app/dist ./dist
COPY --from=base /app/libs ./libs
COPY --from=base /app/node_modules/.pnpm ./node_modules/.pnpm

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/apps/gateway/main"]
