# RECIPE APP

## Description

Recipe App people to share their **beloved** recipes with others.

## Installation

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

## Running the app

### Database

To setup PostgreSQL database using docker compose use:

```bash
$ docker compose up
```

You can also enable [pgAdmin](https://www.pgadmin.org) - management tool for PostgreSQL by using:

```bash
$ docker compose --profile tools
```

If you want to run this in background add `--detach` or `-d` flag at the end.

**Make sure Docker service is running on your machine!**

<br>

### Start the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

### !TODO
