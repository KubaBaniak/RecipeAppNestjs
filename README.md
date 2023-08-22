# RECIPE APP

# Description

Recipe App for people to share their **beloved** recipes with the others.

# Installation

1. Clone this repository with:

```bash
$ git clone https://github.com/KubaBaniak/RecipeAppNestjs.git
```

<br>

2. Set up `.env` file - in a root project folder you need to create a .env file containing application secrets. You can copy the contents of the example.env and fill the keys with the secrets' values.

<br>

3. Make sure, you are running correct Node.js version with following command:

```bash
$ nvm use
```

Double-check if nvm is installed on your machine. If not, [install it](https://github.com/nvm-sh/nvm) and use command above once again or verify if the version you are using matches the one provided in `.nvmrc` file.

<br>

4. Install necessary dependencies by using:

```bash
$ npm install
```

<br>

5. Generate Prisma Client used in this project with:

```bash
$ npx run prisma:generate
```

<br>

# Running the app

## Database & Cache

To setup PostgreSQL database using docker compose use:

```bash
$ docker compose --profile dependencies up
```

You can also enable [pgAdmin](https://www.pgadmin.org) - management tool for PostgreSQL by using:

```bash
$ docker compose --profile dependencies --profile tools up
```

---

⚠️ **WARNING** ⚠️ 

After successfull database initalization, migrations have to be performed. Use:

```bash
# for development
$ npx prisma migrate dev

# for production
$ npx prisma migrate prod
```

---

If you want to run this in background add `--detach` or `-d` flag at the end.

**Make sure Docker service is running on your machine!**
<br>

## Start the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
# OR
$ docker build . && docker compose --profile app --profile dependencies up -d
```

# Tests

In order to trigger tests run one of the following commands:

```bash
# run unit tests
$ npm run test

# run end-to-end tests
$ npm run test:e2e

# run tests in watch-mode
$ npm run test:watch
$ npm run test:e2e:watch
```
