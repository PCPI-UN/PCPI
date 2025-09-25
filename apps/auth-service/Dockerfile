# ---- Base ----
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps apps
COPY libs libs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# ---- Build ----
FROM base AS build
ARG APP_NAME=auth-service
COPY . .
ENV CI=true
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --frozen-lockfile
RUN pnpm --filter ${APP_NAME} exec prisma generate
RUN pnpm --filter ${APP_NAME} build

# ---- Prune ----
FROM base AS prune
ARG APP_NAME=auth-service
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json
RUN pnpm install --prod --no-frozen-lockfile

# ---- Final ----
FROM node:20-alpine AS final
ARG APP_NAME=auth-service
USER node
WORKDIR /home/node/app
COPY --from=prune /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/apps/${APP_NAME}/prisma/schema.prisma ./
COPY --from=prune --chown=node:node /usr/src/app/dist/apps/${APP_NAME} ./
COPY --from=prune --chown=node:node /usr/src/app/package.json ./
EXPOSE 3000
CMD ["node", "main.js"]
