const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const { series, concurrent, rimraf, mkdirp } = require('nps-utils');

// cleaner func
const cleanDist = rimraf('./dist');
const cleanGenerated = rimraf('./src/server/generated');
const cleanDbGenerated = rimraf('./src/tests/db/generated');
const cleanNexusTypegen = rimraf('./src/@types/nexus-typegen');

// read env variables
let envPath = '';
switch (process.env.NODE_ENV) {
  case 'production':
    envPath = path.join(__dirname, 'config', 'production.env');
    break;
  case 'development':
    envPath = path.join(__dirname, 'config', 'development.env');
    break;
  case 'test':
    envPath = path.join(__dirname, 'config', 'test.env');
    const sqliteDbPath = path.join(__dirname, 'src', 'tests', 'db');
    if (!fs.existsSync(sqliteDbPath)) fs.mkdirSync(sqliteDbPath);
    process.env.SQLITE_URL = `file:${path.join(sqliteDbPath, 'data.sqlite')}`;
    break;
  default:
    throw new Error(`NODE_ENV '${process.env.NODE_ENV}' not managed!`);
}

dotenv.config({ path: envPath });

// export different scripts for different environments!
let scriptsToExport = {};
switch (process.env.NODE_ENV) {
  case 'production':
    scriptsToExport = {
      default: {
        description: 'clean, build and start the server in production',
        script: series.nps('prisma.migrate.up', 'build', 'start'),
      },
      start: 'node dist/',
    };
    break;
  case 'development':
    scriptsToExport = {
      default: {
        description: 'start the development server',
        script: 'nodemon -e ts,tsx -i ./src/tests -x ts-node src/',
      },
    };
    break;
  case 'test':
    scriptsToExport = {
      default: {
        description: 'start the test suite',
        script: series.nps('clean.db', 'jest'),
      },
      jest: 'jest',
      majestic: 'majestic --port=4001 --noOpen',
      watch: 'jest --watch',
    };
    break;

  default:
    throw new Error(`NODE_ENV '${process.env.NODE_ENV}' not managed!`);
}

// common scripts
const commonScriptsToExport = {
  build: series.nps('clean.dist', 'generate', 'tsc'),
  tsc: 'tsc',
  clean: {
    dist: series(cleanDist),
    generated: series(cleanGenerated),
    db: series(cleanDbGenerated),
    nexus: series(cleanNexusTypegen),
    all: concurrent.nps('clean.dist', 'clean.generated', 'clean.db', 'clean.nexus'),
    default: series.nps('clean.all'),
  },
  generate: {
    prismaClient: 'prisma2 generate',
    nexus: 'cross-env NODE_ENV=development TRANSPILE_ONLY=true ts-node --transpile-only ./src/server/schema',
    graphqlCodegen: 'graphql-codegen',
    cnt: 'cnt --schema ./prisma/schema.prisma --outDir ./src/server/generated --mq -f -o',
    ct: 'create-types --schema ./prisma/schema.prisma --outDir ./src/server/generated',
    default: series.nps('clean.generated', 'clean.nexus', 'generate.prismaClient', 'generate.nexus'),
  },
  prisma: {
    migrate: {
      save: 'prisma2 migrate save --experimental',
      up: 'prisma2 migrate up --experimental',
      down: 'prisma2 migrate down --experimental',
      default: series.nps('prisma.migrate.save'),
    },
    studio: 'prisma2 studio',
    introspect: 'prisma2 introspect',
  },
  fixMissingDeclarations: series('dts-gen -m xss-clean -f ./node_modules/xss-clean/lib/index.d.ts -o'),
};

const scriptsOptions = { silent: false };

scriptsToExport = {
  scripts: { ...scriptsToExport, ...commonScriptsToExport },
  options: { ...scriptsOptions },
};

module.exports = scriptsToExport;
