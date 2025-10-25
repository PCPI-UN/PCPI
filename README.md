# PCPI

Welcome to the PCPI Microservice repo!

## 🏗️ Architecture

This project is a microservices-based application built with NestJS and gRPC. It consists of:

- **Gateway** - HTTP/REST API gateway (port 3000)
- **Auth Service** - Authentication & authorization (port 50051)
- **Evaluation Service** - Evaluation management (port 50052)
- **Event Service** - Event management (port 50053)
- **Invitation Service** - Invitation handling (port 50054)
- **Project Service** - Project management (port 50055)
- **Notification Service** - Email notifications (port 50056)

Each service has its own PostgreSQL database and communicates via gRPC.

## 📚 API Documentation

Since we are using gRPC for our services, we can't use Swagger to build an API docs page in the conventional way. For this reason, the API contracts are defined in the proto folder under `/libs/common/src/protos`. There you can find all the contracts for each service!

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- pnpm installed (`npm install -g pnpm`)

### Development Mode (Recommended)

The easiest way to run the entire application in development mode with hot reload:

```bash
# Using Makefile (recommended)
make dev-up

# Or using docker-compose directly
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up

# Run in background
make dev-up-d
# or
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up -d

# View logs
make dev-logs
# or
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f

# Stop services
make dev-down
# or
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down
```

**Development Features:**
- ✅ Hot reload enabled - code changes automatically restart services
- ✅ Volume mounts for live code editing
- ✅ Database ports exposed (5432-5436) for local tools like pgAdmin or DBeaver
- ✅ Automatic Prisma migrations and proto generation on startup
- ✅ Uses `.env` files from each service directory

### Production Mode

For production deployment:

```bash
# 1. Create environment file from example
cp .env.example .env

# 2. Edit .env and fill in production values (database passwords, JWT secrets, etc.)
nano .env

# 3. Start services
make prod-up
# or
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d

# View logs
make prod-logs

# Stop services
make prod-down
```

**Production Features:**
- ✅ Optimized production builds
- ✅ No exposed database ports (internal network only)
- ✅ Environment variables from system/CI (not .env files in services)
- ✅ Restart policies configured
- ✅ Health checks enabled

### Available Make Commands

```bash
make help           # Show all available commands
make dev-up         # Start dev services
make dev-down       # Stop dev services
make dev-logs       # View dev logs
make dev-build      # Build dev services
make dev-rebuild    # Rebuild without cache
make prod-up        # Start prod services
make prod-down      # Stop prod services
make prod-logs      # View prod logs
make proto-gen      # Generate protobuf files
make clean          # Clean Docker resources
make clean-all      # Clean all Docker resources including images

# Individual services (dev mode)
make gateway        # Start only gateway
make auth           # Start only auth-service
make eval           # Start only evaluation-service
make event          # Start only event-service
make invite         # Start only invitation-service
make project        # Start only project-service
make notify         # Start only notification-service
```

## 🔧 Development Setup

### Running Individual Services Locally

If you want to run a service outside Docker for development:

1. **Set up databases:**
   ```bash
   # Start only databases
   docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up auth-db evaluation-db event-db invitation-db project-db -d
   ```

2. **Generate proto files:**
   ```bash
   make proto-gen
   # or
   npm run proto:generate
   ```

3. **Run a specific service:**
   ```bash
   # Example: Run auth service
   cd apps/auth-service
   pnpm install
   npx prisma generate
   npx prisma db push
   pnpm run start:dev
   ```

### Environment Variables

Each service requires its own `.env` file:

- `apps/auth-service/.env`
- `apps/evaluation-service/.env`
- `apps/event-service/.env`
- `apps/invitation-service/.env`
- `apps/project-service/.env`
- `apps/gateway/.env`
- `apps/notification-service/.env`

Create these files based on the service requirements. Common variables include:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- Service-specific configuration

## 🛠️ Working with Protobuf

### Generate TypeScript files from proto definitions

You just need to create your `proto` file under `/libs/common/src/protos` and then run:

```bash
make proto-gen
# or
pnpm run proto:generate
```

Your TypeScript files will be generated automatically in `/libs/common/src/generated`!

## 🐳 Docker Compose Files

The project uses multiple Docker Compose files for different environments:

- **`docker-compose.base.yml`** - Base configuration shared across all environments
- **`docker-compose.dev.yml`** - Development-specific overrides (hot reload, exposed ports)
- **`docker-compose.prod.yml`** - Production-specific overrides (optimized builds, security)
- **`docker-compose.yml`** - Legacy production setup (deprecated, use new setup above)

For more details, see [README.docker.md](./README.docker.md).

## 🔍 Monitoring & Debugging

### Check service health
```bash
docker ps
```

All services have a `health` status that you can check in the output.

### View logs for specific service
```bash
# Development
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f gateway

# Production
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml logs -f gateway
```

### Access databases
In development mode, databases are exposed on these ports:
- Auth DB: `localhost:5432`
- Evaluation DB: `localhost:5433`
- Event DB: `localhost:5434`
- Invitation DB: `localhost:5435`
- Project DB: `localhost:5436`

Use any PostgreSQL client (pgAdmin, DBeaver, etc.) with credentials:
- User: `postgres`
- Password: `postgres` (development only!)
- Database: `{service}_service`

## 🧹 Troubleshooting

### Clean rebuild
```bash
make dev-down-v      # Stop and remove volumes
make dev-rebuild     # Rebuild without cache
make dev-up          # Start fresh
```

### Proto generation fails
```bash
make proto-gen       # Generate locally first
make dev-restart     # Then restart containers
```

### Database connection issues
1. Check that database health checks are passing: `docker ps`
2. Verify `DATABASE_URL` in service .env files matches container names
3. Check for port conflicts with locally running PostgreSQL

## 📖 Additional Resources
- [Proto Files](./libs/common/src/protos) - gRPC service contracts
