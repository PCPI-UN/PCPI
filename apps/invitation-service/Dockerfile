# ---- Base ----
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm fetch

# ---- Build ----
FROM base AS build
ARG APP_NAME=invitation-service
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm install -r --offline --frozen-lockfile
RUN pnpm --filter ${APP_NAME} build

# ---- Prune ----
FROM base AS prune
ARG APP_NAME=invitation-service
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json
RUN pnpm install --prod --no-frozen-lockfile

# ---- Final ----
FROM node:lts-alpine AS final
ARG APP_NAME=invitation-service
USER node
WORKDIR /home/node/app
COPY --from=prune /usr/src/app/node_modules ./node_modules
COPY --from=prune --chown=node:node /usr/src/app/dist/apps/${APP_NAME} ./
COPY --from=prune --chown=node:node /usr/src/app/package.json ./
EXPOSE 3000
CMD ["node", "main.js"]
