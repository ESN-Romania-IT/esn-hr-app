# ESN HR App

ESN HR App is a monorepo that contains a **frontend** (Vite + React + TypeScript + Tailwind CSS) and a **backend** (Node.js + Express) service. The repository is organized using npm workspaces to keep each part isolated while still providing convenient root‑level commands for development.

---

## Tech Stack

- **Frontend**
  - Vite
  - React
  - TypeScript
  - Tailwind CSS
- **Backend**
  - Node.js
  - Express
  - CORS

Npm workspaces are used to manage both projects in a single repository, sharing tooling where it makes sense.

---

## Repository Structure

```text
esn-hr-app/
  package.json          # root monorepo config (workspaces + shared scripts)
  package-lock.json
  frontend/             # Vite + React + TS + Tailwind app
    package.json
    src/
    ...
  backend/              # Node + Express API
    package.json
    src/
    ...
```

The `frontend` and `backend` folders are independent npm workspaces, each with its own configuration and dependencies.

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Install dependencies

From the repository root:

```bash
npm run install:all
```

This uses npm workspaces to install dependencies for both `frontend` and `backend` in a single step.

---

## Scripts

All commands below are run from the **repository root**.

### Root scripts

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "install:all": "npm install --workspaces",
  "dev": "concurrently \"npm run dev --workspace frontend\" \"npm run dev --workspace backend\"",
  "dev:frontend": "npm run dev --workspace frontend",
  "dev:backend": "npm run dev --workspace backend"
}
```

- `npm run install:all`  
  Installs dependencies for all workspaces (`frontend` and `backend`).

- `npm run dev`  
  Starts **frontend** and **backend** in parallel for full‑stack development (using `concurrently`).

- `npm run dev:frontend`  
  Starts only the **frontend** dev server via the `frontend` workspace.

- `npm run dev:backend`  
  Starts only the **backend** dev server via the `backend` workspace.

### Workspace‑local scripts (examples)

From inside `frontend/`:

- `npm run dev` – Start Vite dev server.
- `npm run build` – Build production bundle.
- `npm run preview` – Preview the built app locally.

From inside `backend/` (example):

- `npm run dev` – Start backend in watch mode (e.g., via `nodemon`).
- `npm run start` – Start compiled backend server.

---

## Development Workflow

1. Clone the repository.
2. Run `npm run install:all` to install all dependencies.
3. Run `npm run dev` to start frontend and backend together, or use `dev:frontend` / `dev:backend` to run them separately.

The frontend typically runs on a Vite dev server (for example, `http://localhost:5173`), and the backend runs on its own port (for example, `http://localhost:3000`).

---

## License

This project is licensed under the **ISC** license, as defined in the root `package.json`.