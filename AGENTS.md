# AGENTS.md — Iris / PCPI

Canonical conventions live in **`LLM_RULES.md`** (root). Read it before touching any service. This file adds operational facts that LLM_RULES.md omits.

---

## Stack at a glance

- **NestJS 11 monorepo** (NestJS CLI mode, not Nx/Turborepo) · TypeScript 5.7 · pnpm · CommonJS output
- **gRPC** (via `@grpc/grpc-js` + `ts-proto`) for all inter-service communication
- **Prisma 6** + **PostgreSQL 16** (per-service schemas) · **Redis 7** (gateway caching, mostly disabled)
- **Deployment**: Docker → Coolify (ARM64 Linux)

---

## Monorepo layout

```
apps/
  gateway/            # HTTP/REST entry — port 3000; no business logic here
  auth-service/       # Auth, users, roles, permissions — gRPC :50051
  evaluation-service/ # Criterions & evaluations — gRPC :50052
  event-service/      # Courses & events — gRPC :50053
  invitation-service/ # Invitations & user onboarding — gRPC :50054
  project-service/    # Projects — gRPC :50055
  notification-service/ # Email via Azure ACS — gRPC :50056 (no DB)
libs/common/src/
  protos/             # Source .proto files — edit these
  generated/          # ts-proto output — COMMITTED, do not hand-edit
```

---

## Developer commands

### Environment
```bash
cp .env.example .env   # required before any make target; JWT keys have no defaults
```

### Dev (hot reload via Docker bind-mount)
```bash
make dev-build         # build dev images
make dev-up            # start all services
make dev-down
make dev-logs
make dev-rebuild       # rebuild without cache
make clean-all         # REQUIRED when switching dev → prod (clears volumes/cache)
```

### Prod (test before shipping)
```bash
make prod-build
make prod-up
make prod-down
make prod-logs
```

### Build
```bash
pnpm run build                    # nest build — targets GATEWAY only (nest-cli.json default)
pnpm exec nest build auth-service # build a specific service
```
> Pre-commit hook runs `pnpm run build` (gateway). Service-specific errors only surface when that service is explicitly built.

### Test
```bash
pnpm run test                             # all *.spec.ts
pnpm run test -- --testPathPattern="auth-service"          # filter by path
pnpm run test -- --testNamePattern="CreatePlatformUser"    # filter by name
pnpm run test -- apps/auth-service/src/modules/users/application/use-cases/tests/create-platform-user.use-case.spec.ts
pnpm run test:cov                         # coverage → ./coverage/
pnpm run test:e2e                         # gateway e2e (not run in CI)
```
All unit tests use pure `jest.fn()` mocks — no running services or test DB needed.

### Lint & format
```bash
pnpm run lint      # eslint --fix on src/apps/libs
pnpm run format    # prettier --write apps/**/*.ts libs/**/*.ts
```

### Proto generation
```bash
make proto-gen     # = pnpm run proto:generate
```
Run this before building locally whenever `.proto` files change. Inside Docker this runs automatically. Requires `protoc` installed locally.

### Prisma (always pass `--schema`)
```bash
pnpm exec prisma generate --schema=./apps/auth-service/prisma/schema.prisma
pnpm exec prisma migrate deploy --schema=./apps/auth-service/prisma/schema.prisma
pnpm exec prisma db push --schema=./apps/evaluation-service/prisma/schema.prisma --accept-data-loss  # dev only
pnpm exec prisma db seed   # auth-service only; idempotent
```

---

## Architecture rules (summary of LLM_RULES.md)

1. **Implement in the service first, verify it works, then expose in the gateway.**
2. **Use-cases depend only on abstract ports** — never on concrete adapters.
3. **Controllers are thin**: call use-case → call mapper → return.
4. **Mappers** (`application/mappers/`) translate use-case output → ts-proto generated types.
5. **One use-case per endpoint** unless an existing one is reusable.
6. **Domain entities are always classes** (not interfaces).
7. **gRPC methods return Promises, not Observables.**
8. **When a service calls another service via gRPC**, create an abstract port under `infrastructure/ports/` and a concrete adapter under `infrastructure/adapters/`. Inject the port, not the gRPC client directly.
9. **gRPC client registration**: always use `ClientsModule.registerAsync` with `ConfigService`.
10. **Path aliases only** — never use `../../`; `./` within the same directory is fine. Each service defines aliases in its `tsconfig.app.json`.
11. **Pagination**: page-based (`page` + `limit`); response always includes `PaginationMetadata` (`total`, `itemsOnCurrentPage`, `itemsPerPage`, `currentPage`, `totalPages`).
12. **DTOs use class-validator**; `ValidationPipe` maps errors to `RpcException({ code: 3, message })`.
13. **Error mapping**: services throw `RpcException` with gRPC codes; gateway's `GrpcExceptionFilter` maps them to HTTP (`NOT_FOUND`→404, `ALREADY_EXISTS`→409, `INVALID_ARGUMENT`→400, `UNAUTHENTICATED`→401, `PERMISSION_DENIED`→403).

---

## Gateway specifics

- Global guards: `JwtAuthGuard` + `PermissionsGuard`
- `@Public()` skips JWT guard; `@RequirePermission('action:resource')` gates by permission
- `@GetUser()` extracts the authenticated user from the request
- Swagger at `/api/docs`; auth via `access_token` HTTP-only cookie
- Redis caching infrastructure exists but **global HTTP cache interceptor is commented out**
- `ALLOW_INSECURE_COOKIES=true` in dev, `false` in prod

---

## Toolchain quirks

- **`nest build` without a project name targets the gateway** — not the service you may be working on.
- **`libs/common/src/generated/` is committed** — regenerate with `make proto-gen`, never edit by hand.
- **`pnpm-workspace.yaml` does not define workspace packages** in the usual sense; the monorepo is managed entirely by NestJS CLI.
- **Proto files are copied to `dist/` at build time** (`"assets": ["**/*.proto"]` in `nest-cli.json`) and loaded at runtime for gRPC.
- **notification-service has no database** — no Prisma, no migrations.
- **Auth-service uses `migrate deploy` even in dev**; other services use `db push` in dev Docker Compose.
- **Single PostgreSQL instance in prod** with per-service databases initialized by `docker/postgres-init.sh`.
- **Hot reload uses polling** (`CHOKIDAR_USEPOLLING=true`) because source is bind-mounted into Docker.

---

## Commit conventions

Format: `[taskId]: message` (e.g., `[42]: add grpc method for project approval`)
- `taskId` is required and enforced by commitlint (commit-msg hook).
- Pre-commit hook runs `pnpm run build` (gateway) — compilation must pass.

---

## CI/CD

- CI builds ARM64 images and pushes to Docker Hub on PR to `dev` or `prod` branches.
- Services with DB (auth, evaluation, event, invitation, project) deploy migrations first, then the main app via Coolify webhooks.
- Gateway and notification-service deploy without migration step.

---

## Workflow rules (from LLM_RULES.md)

- **Ask before assuming.** If the request is unclear, ask for clarification before writing code.
- **Check conventions before coding.** If a proposed change violates project conventions, say so and quote the rule.
- **One task at a time.** Complete and request review before moving to the next task.
- **Remind the user to test in production mode** once dev testing passes.
- **If a service is a mess** (not following conventions), note it as technical debt but adapt — do not propose unsolicited refactors.
