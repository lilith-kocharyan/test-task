<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This is a NestJS-based application that allows users to register, log in, send friend requests, and manage friend relationships with advanced searching functionality. The backend uses PostgreSQL as the database and JWT for authentication. This project was created for testing purposes.

## Requirements

Node.js (v20.19.0)

PostgreSQL

NestJS

## Set up your .env file

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your-db-username
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name
JWT_SECRET=your-jwt-secret

## Create the PostgreSQL database:

Make sure your PostgreSQL instance is running and create a database. You can name it whatever you'd like (e.g., social_network).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Endpoints

Authentication
POST /auth/register

Registers a new user

Body: { firstName: string, lastName: string, age: number, email: string, password: string }

POST /auth/login

Logs in a user and returns a JWT access token

Body: { email: string, password: string }

Users
GET /users

Fetches all users (admin only)

GET /users/search

Advanced search for users by first name, last name, and age

Query Params: firstName, lastName, age

Friends
POST /friends/:receiverId

Sends a friend request from the authenticated user to the user with ID receiverId

Authorization: Bearer token

PATCH /friends/:requestId

Accepts or declines a friend request

Body: { status: 'accepted' | 'declined' }

Authorization: Bearer token

GET /friends/requests

Fetches incoming friend requests for the authenticated user

Authorization: Bearer token

GET /friends

Fetches the list of friends for the authenticated user

Authorization: Bearer token
