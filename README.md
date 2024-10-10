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
