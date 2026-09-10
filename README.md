# @cypress-tools/mysql

MySQL plugin for Cypress - query, seed, and clean your database directly from your E2E tests.

[![CI](https://github.com/LeJeanbono/cypress-mysql/actions/workflows/ci.yml/badge.svg)](https://github.com/LeJeanbono/cypress-mysql/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@cypress-tools/mysql.svg)](https://www.npmjs.com/package/@cypress-tools/mysql)
[![npm downloads](https://img.shields.io/npm/dm/@cypress-tools/mysql.svg)](https://www.npmjs.com/package/@cypress-tools/mysql)
[![license](https://img.shields.io/npm/l/@cypress-tools/mysql.svg)](https://github.com/LeJeanbono/cypress-mysql/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@cypress-tools/mysql.svg)](https://www.npmjs.com/package/@cypress-tools/mysql)
![Cypress](https://img.shields.io/badge/Cypress-tested-green?logo=cypress)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue?logo=mysql)
<!-- Exact tested versions (Cypress, mysql2, Node): see Requirements below and package.json -->

> Seed test data before a test, assert side effects after an action, and clean up afterwards - without leaving Cypress.

## Why?

E2E tests often need deterministic database state:

- create a user / order / fixture before visiting the UI
- assert that a UI action actually wrote to the DB
- clean tables between tests to avoid flakiness

This plugin exposes MySQL operations as Cypress tasks **and** chainable `cy.*` commands, with TypeScript generics out of the box.

## Features

- Raw SQL via `mysqlQuery`
- Helpers for common operations: `select`, `insert`, `delete`, `create` / `drop` table
- `WHERE` builder with custom operands (`=`, `>`, `LIKE`, …)
- TypeScript generics: `cy.mysqlSelectAll<User>(...)`
- `cy.task()` API also available if you prefer not to load commands
- Powered by [`mysql2`](https://github.com/sidorares/node-mysql2)

## Requirements

- Node.js `>= 24`
- Cypress `>= 10` (tested on Cypress 16)
- MySQL `5.7` / `8.x`

## Installation

```bash
npm install --save-dev @cypress-tools/mysql
# or
yarn add -D @cypress-tools/mysql
# or
pnpm add -D @cypress-tools/mysql
```

## Quick start

### 1. Register the plugin

In `cypress.config.ts`:

```ts
import { defineConfig } from 'cypress'
import { plugin } from '@cypress-tools/mysql'

export default defineConfig({
  env: {
    MYSQL_HOST: 'localhost',
    MYSQL_PORT: '3306',
    MYSQL_DB: 'mydb',
    MYSQL_USER: 'root',
    MYSQL_PASSWORD: 'root',
  },
  e2e: {
    setupNodeEvents(on, config) {
      plugin(on, config, { debug: true })
      return config
    },
  },
})
```

> Legacy signature `plugin(config, on)` is still supported but deprecated. Use `plugin(on, config)`.

### 2. Register the commands

In `cypress/support/e2e.ts`:

```ts
import '@cypress-tools/mysql/dist/commands'
// or, from source in this repo:
// import '../../src/commands'
```

### 3. Use it in a test

```ts
interface User {
  id: number
  name: string
}

it('creates a user from the UI', () => {
  cy.mysqlDeleteAll({ table: 'person' })

  cy.visit('/signup')
  cy.get('[name=name]').type('bob')
  cy.get('button[type=submit]').click()

  cy.mysqlSelectAll<User>({ table: 'person' }).then((users) => {
    expect(users).to.deep.equal([{ id: 1, name: 'bob' }])
  })
})
```

## Configuration

### Environment variables

| Variable         | Description      | Example     |
| ---------------- | ---------------- | ----------- |
| `MYSQL_HOST`     | MySQL host       | `localhost` |
| `MYSQL_PORT`     | MySQL port       | `3306`      |
| `MYSQL_DB`       | Database name    | `mydb`      |
| `MYSQL_USER`     | User             | `root`      |
| `MYSQL_PASSWORD` | Password         | `root`      |

You can override them per run:

```bash
cypress run --env MYSQL_HOST=localhost,MYSQL_PORT=3307,MYSQL_DB=mydb,MYSQL_USER=root,MYSQL_PASSWORD=root
```

### Plugin options

```ts
plugin(on, config, {
  debug: true,               // log queries to Cypress stdout, default: false
  mysqlOptions: {            // extra options forwarded to mysql2.createConnection()
    timezone: 'UTC',
  },
})
```

## API

All helpers exist in two flavors:

- Chainable command: `cy.mysqlSelectAll(...)`
- Task: `cy.task('mysqlSelectAll', ...)` (no import needed in `support/e2e.ts`)

| Command | Task name | Description | Returns |
| ------- | --------- | ----------- | ------- |
| `cy.mysqlQuery(sql)` | `mysqlQuery` | Raw SQL query | `T[]` |
| `cy.mysqlSelectAll({ table })` | `mysqlSelectAll` | `SELECT * FROM table` | `T[]` |
| `cy.mysqlSelectWhere({ table, where })` | `mysqlSelectWhere` | `SELECT * … WHERE …` | `T[]` |
| `cy.mysqlInsertInto({ table, data })` | `mysqlInsertInto` | Insert one row | `insertId: number` |
| `cy.mysqlInsertInto({ table, datas })` | `mysqlInsertInto` | Insert many rows | `number[]` |
| `cy.mysqlDeleteAll({ table })` | `mysqlDeleteAll` | `DELETE FROM table` | `affectedRows: number` |
| `cy.mysqlDeleteWhere({ table, where })` | `mysqlDeleteWhere` | `DELETE … WHERE …` | `affectedRows: number` |
| `cy.mysqlCreateTable({ table, columns })` | `mysqlCreateTable` | `CREATE TABLE …` | - |
| `cy.mysqlDropTable(table)` | `mysqlDropTable` | `DROP TABLE IF EXISTS …` | - |

### Raw query

```ts
// typed result
cy.mysqlQuery<User>('SELECT * FROM person').then((users) => {
  expect(users[0].name).to.eq('bob')
})
```

### Select all

```ts
cy.mysqlSelectAll<User>({ table: 'person' }).then((users) => {
  expect(users).to.have.length(2)
})
```

### Select where

```ts
cy.mysqlSelectWhere<User>({
  table: 'person',
  where: [{ column: 'name', value: 'bob' }],
}).then((users) => {
  expect(users).to.deep.equal([{ id: 1, name: 'bob' }])
})

// multiple clauses = AND, custom operand supported
cy.mysqlSelectWhere<User>({
  table: 'person',
  where: [
    { column: 'name', value: 'bob' },
    { column: 'id', operand: '>', value: 10 },
  ],
})
```

Where clause shape:

```ts
{
  column: string
  value: string | number
  operand?: string // default: '='
}
```

### Insert

```ts
// one row → resolves with insertId
cy.mysqlInsertInto<User>({
  table: 'person',
  data: { name: 'bob' },
}).then((insertId) => {
  expect(insertId).to.eq(1)
})

// many rows → resolves with insertIds
cy.mysqlInsertInto<User>({
  table: 'person',
  datas: [{ name: 'bob' }, { name: 'bobby' }],
}).then((ids) => {
  expect(ids).to.deep.equal([1, 2])
})
```

### Delete

```ts
// delete all rows → resolves with affectedRows
cy.mysqlDeleteAll({ table: 'person' }).then((count) => {
  expect(count).to.eq(2)
})

// delete with conditions
cy.mysqlDeleteWhere({
  table: 'person',
  where: [{ column: 'name', value: 'bob' }],
}).then((deleted) => {
  expect(deleted).to.eq(1)
})
```

### Create / drop table

Useful to reset schema in `before()` hooks or scratch test envs:

```ts
cy.mysqlDropTable('person')

cy.mysqlCreateTable({
  table: 'person',
  columns: [
    { key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' },
    { key: 'name', type: 'VARCHAR(100)' },
  ],
})
```

### Using `cy.task()` directly

If you don't want the custom commands, call tasks directly:

```ts
import type { MysqlTask } from '@cypress-tools/mysql/dist/tasks'

cy.task('mysqlSelectAll', { table: 'person' })
cy.task('mysqlQuery', 'SELECT * FROM person')
```

## TypeScript

All read commands are generic:

```ts
interface Person {
  id: number
  name: string
}

cy.mysqlQuery<Person>('SELECT * FROM person')
cy.mysqlSelectAll<Person>({ table: 'person' })
cy.mysqlSelectWhere<Person>({ table: 'person', where: [{ column: 'name', value: 'me' }] })
```

## Common recipes

### Seed before, clean after

```ts
beforeEach(() => {
  cy.mysqlDropTable('person')
  cy.mysqlCreateTable({
    table: 'person',
    columns: [
      { key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' },
      { key: 'name', type: 'VARCHAR(100)' },
    ],
  })
  cy.mysqlInsertInto({ table: 'person', datas: [{ name: 'alice' }, { name: 'bob' }] })
})

afterEach(() => {
  cy.mysqlDeleteAll({ table: 'person' })
})
```

### Assert DB side effects

```ts
cy.get('button#checkout').click()

cy.mysqlSelectWhere<Order>({
  table: 'orders',
  where: [{ column: 'status', value: 'paid' }],
}).should('have.length', 1)
```

## Local development

This repo ships a `docker-compose.yml` with MySQL 5.7 (`:3307`) and MySQL latest (`:3308`):

```bash
docker compose up -d

npm install
npm run cy:run      # default port 3307, see cypress.config.ts
npm run cy:run8     # run against MySQL latest on port 3308
```

Build:

```bash
npm run build
```

## Contributing

Contributions welcome! See [CHANGELOG](CHANGELOG.md) for release history.

1. Fork the repo and create a branch
2. `docker compose up -d` + `npm install`
3. Add / update tests under `cypress/e2e/`
4. Open a PR - CI must pass

This project uses [semantic-release](https://github.com/semantic-release/semantic-release): use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:` …) for automatic versioning.

Please open an issue first for large changes.

## License

MIT © Jean-Michel LECLERCQ - see [LICENSE](LICENSE).

## Links

- npm: https://www.npmjs.com/package/@cypress-tools/mysql
- Issues: https://github.com/LeJeanbono/cypress-mysql/issues
- Changelog: https://github.com/LeJeanbono/cypress-mysql/blob/master/CHANGELOG.md
