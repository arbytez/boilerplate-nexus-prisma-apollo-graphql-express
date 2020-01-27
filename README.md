# ✨ Boilerplate project for nexus-prisma apollo-express-graphql backend server

> ⚠️ **_Disclaimer_**: the project uses the [_prisma2 framework_](https://github.com/prisma/prisma2) that is not ready for **production** yet. See [**`isprisma2ready.com`**](https://www.isprisma2ready.com).

> Code written using nodejs version LTS `>= 12.x.x`.

This project wants to be a starting point for more complex backend projects using **graphql**. Of his own, it manages the backend for a simple **todo application** but it handles important other topics besides the basic crud api for todos.

## Getting started

The project uses **nps** ([_npm-package-scripts_](https://github.com/sezna/nps)) so in the file [_package.json_](/package.json) there are only 3 scripts, one for each main environment, and the scripts logic inside [_package-scripts.js_](/package-scripts.js):

```
"scripts": {
    "dev": "cross-env NODE_ENV=development nps",
    "prod": "cross-env NODE_ENV=production nps",
    "test": "cross-env NODE_ENV=test nps"
  },
```

```
npm i                                       # install dependencies packages (there are a few 😧)
npm run <dev|test|prod> generate            # generate prisma-client-js library and typescript definitions for nexus-prisma. Before doing it, set the environment variables needed
npm run dev                                 # start development server
npm run test                                # start jest tests suite
npm run prod                                # generate, build and start the production server

npm run <dev|test|prod> prisma.migrate         # create migration
npm run <dev|test|prod> prisma.migrate.up      # apply migration
npm run <dev|test|prod> prisma.migrate.down    # rollback migration

npm run dev generate.nexus                  # useful to generate only the nexus typescript definitions while implementing new features
```

### Environment variables

Check file [_environment.example.env_](/config/environment.example.env) or [_test.example.env_](/config/test.example.env), then create for each environment the relative env file with the env var wanted.

```
config/development.env                      # for development
config/test.env                             # for test
config/production.env                       # for production
```

- `COOKIE_SECRET` cookie secret for signed cookies
- `FRONTEND_URLS` list of urls separated by a comma for cors options
- `JWT_SECRET` jsonwebtoken secret for auth operations
- `JWT_TOKEN_EXPIRES_SEC_IN` amount of seconds that the generated jwt token will be valid
- `PORT` server port, default _4000_
- `POSTGRES_URL` postgres db access url
- `POSTGRES_URL_ENABLED` true/false, see [switching-data-sources-based-on-environments](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md#switching-data-sources-based-on-environments) and [supported-databases](https://github.com/prisma/prisma2/blob/master/docs/supported-databases.md)
- `REDIS_HOST` redis db hostname, used for graphql subscriptions
- `REDIS_PASSWORD` redis db password
- `REDIS_PORT` redis db port, default _6379_
- `SQLITE_URL` sqlite db url, db used for tests
- `SQLITE_URL_ENABLED` true/false, like `POSTGRES_URL_ENABLED` env variable
- `WRITE_CUSTOM_LOG_TO_FILE` yes/no, write log only to console or console and filesystem

## Graphql server security

- **express middlewares**
  - [xss-clean](https://github.com/jsonmaur/xss-clean)
  - [helmet](https://github.com/helmetjs/helmet)
  - [hpp](https://github.com/analog-nico/hpp)
  - [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize)
  - [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- **apollo-graphql**
  - validation rules (_definitionLimit, depthLimit, fieldLimit_): same logic from the **_keystonejs_** framework [check here](https://github.com/keystonejs/keystone/blob/master/packages/app-graphql/validation.js)
  - [graphql-rate-limit](https://github.com/teamplanes/graphql-rate-limit)
  - [graphql-shield](https://github.com/maticzav/graphql-shield) 🛡️
  - for query limiting: input field rules have been used. ([first, last field](/src/server/middlewares/permissions/inputRules.ts))

## Tests

Before run `npm run test`, set the `config/test.env` file and run `npm run test prisma.migrate.up` (check [prisma2 docs](https://github.com/prisma/prisma2/tree/master/docs) to see the correct flow to follow). This command will set your sqlite db on `/src/tests/db/data.sqlite`. This db should not contain data and schema must be updated (run `prisma.migrate.up` in test env every time the [schema.prisma](/prisma/schema.prisma) is updated).

Each test suite will do (see [testUtils.ts](/src/tests/helpers/testUtils.ts)):

1. a copy of the `data.sqlite` into the `/src/tests/db/generated` folder
2. start the backend server, the port is choosen using [arbitrary-unused-port](https://github.com/ntkme/arbitrary-unused-port)
3. seed the copied db with 'dummy' data that test will use it.
4. run tests
5. clean test environment (close backend server, Prisma-Client connection and delete the copied sqlite db)

## Todo

- [ ] test graphql subscriptions
- [ ] optimize tests flow (tests run need a lot of pc resources to bootstrap the server for each test suite and compilation from typescript)
- [ ] upload file endpoint (not needed but nice to have into the boilerplate project)
- [ ] process manager in production (now it will start the index.js with node without a process manager like `pm2`)
- [ ] use some kind of autogenerated documentation tool system and publish it to `GET /` of the backend server

## Other

> The backend is ready to be used with [CapRover](https://caprover.com/), indeed [captain-definition](/captain-definition) file exist on the root project (see also [dockerfile](/dockerfile)).

> One instance of the backend project is up and running on: [https://nexus-prisma-boilerplate.epbe.dynu.net/graphql](https://nexus-prisma-boilerplate.epbe.dynu.net/graphql). The `FRONTEND_URLS` env var is set to `http://127.0.0.1:3000,http://localhost:3000` so it is possible to play with the backend with a local frontend environment (like `nextjs`).
