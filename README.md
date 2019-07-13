# Gusta API

This repository contains the express-based API that powers the Gusta Project frontend.

## libraries

- [Express](https://expressjs.com/)
- [Sequelize](http://docs.sequelizejs.com/)
- [passport-http-bearer](https://github.com/jaredhanson/passport-http-bearer)
- [postgrator](https://github.com/rickbergfalk/postgrator) to handle SQL migrations

## usage

Before use, from psql as the `postgres` user:

```sql
create database flavors;
create user flavors with encrypted password 'changeme';
grant all privileges on database flavors to flavors;
\c flavors
create extension if not exists "pgcrypto";
```

The `pgcrypto` extension is used to generate UUIDs.

Now, in a shell:

```sh
npm install
cp .env.default .env
```

Configuration resides in `.env`. Edit this file and supply your database information. Finally:

```sh
npm run migrate
npm start
```

You can use `npm run migrate 0` to revert all database migrations, or `npm run migrate X` to migrate to version X.

## docker

Simply run `docker-compose up` from the source root. Use the `--no-start` option to create the containers without starting them in interactive mode.

You can manually migrate the database using

```sh
docker-compose run --rm api npm run migrate
```
