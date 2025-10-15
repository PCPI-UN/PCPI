# PCPI

Welcome to the PCPI Microservice repo!


## About Swagger

Since we are using gRPC for our services, we can't use Swagger to build an API docs page in the conventional way. For this reason, the docs page is the
proto folder under `/libs/common/src/protos`. There you can find all the contracts for each service!

## How to generate proto ts files!

You just need to create your `proto` file under `/libs/common/src/proto` and then run `pnpm run proto:generate` and your typescript files will be generated automatically!

## How to run each service 

If you want to run a service individually, you will need to build the Dockerfile and have a postgres container or engine.

## How to run the whole app

You can run to build both the databases (for each service) and the services
```sh
docker compose build && docker compose up -d
```

All services have a `health` status that you can check via `docker ps`
