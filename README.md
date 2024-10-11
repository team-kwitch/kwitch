# Kwitch
A platform for easy streaming from anywhere on the modern web.

# Repository Structure
This repository is structured as a Monorepo using pnpm.

- `/apps`: This folder holds the actual applications, such as frontend and backend services.
  - `/api`: contains the RESTful API server built with **express.js**.
  - `/socket`: contains the WebSocket server built with **Socket.IO**.
  - `/web`: contains the frontend web application built with **next.js**.
- `/packages`: This folder contains reusable libraries or packages that can be shared across different apps.
  - `/db`: provides database connection using **Prisma** and **redisConnection**.
  - `/auth`: handles authentication logic and user management using **passport.js**.
  - `/types`: contains shared TypeScript types and interfaces.

# Installation and Running the Project

## Prerequisites
- Node.js v18.0 or higher
- pnpm for package management (Install via `npm install -g pnpm`)

## Installation
1. Clone the repository:
```bash
git clone https://github.com/team-kwitch/kwitch.git
cd kwitch
```
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
- Copy the example .env.example file to .env:
```bash
cp .env.example .env
```
- Update the .env file with your configuration values.

## Running the Project
1. Development mode: To start the project in development mode, run:
```bash
pnpm dev
```

## Accessing the Application
- Open your browser and go to __http://localhost:3000__.

# Licence
This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details.
