# Kwitch
A platform for easy streaming from anywhere on the modern web.

# Repository Structure
This repository is structured as a Monorepo using pnpm.

- `/apps`: This folder holds the actual applications, such as frontend and backend services.
  - `/api`: contains the RESTful API server built with **express.js**.
  - `/socket`: contains the WebSocket server built with **Socket.IO**.
  - `/web`: contains the frontend web application built with **next.js**.
- `/packages`: This folder contains reusable libraries or packages that can be shared across different apps.
  - `/db-connection`: provides database connection using **SQLite3** and **Redis**.
  - `/session`: handles session management using **passport.js**.
  - `/domain`: contains shared interfaces.

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

3. Run project:
```bash
pnpm dev
```

## Accessing the Application
- Open your browser and go to http://localhost:3000.

# Licence
This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details.
