# RECIPE APP

## Description

Recipe App people to share their **beloved** recipes with others.

## Installation

Clone this repository with

```bash
$ git clone https://github.com/KubaBaniak/RecipeAppNestjs.git
```

and then install necessary dependencies

```bash
$ npm install
```

and generate Prisma Client used in this project

```bash
$ npx run prisma:generate
```

## Running the app

### Database

This code will set up PostgreSQL and pgAdmin

```bash
$ docker compose up
```

**Make sure Docker service is running on your machine!**

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
