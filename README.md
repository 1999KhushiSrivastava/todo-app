# Todo App

A multi-page todo application with a home screen (reminders and upcoming tasks), an add-task screen, a full task list and a task details page.

- **Frontend:** React + TypeScript + Vite, built as a **multi-page app (MPA)**. Each page is its own HTML entry point; moving between pages is a full browser navigation, not client-side routing.
- **Backend:** Node.js + Express + TypeScript with CRUD APIs.
- **Database:** SQLite (via `better-sqlite3`). The data lives in a single file, `backend/todos.db`.
- **Tests:** Vitest + Supertest (unit tests for the service layer and HTTP tests for the API).
- **API clients:** a REST Client file and a Postman collection in `backend/api/`.

## Documentation

| Doc | What it covers |
| --- | --- |
| [docs/FEATURES.md](docs/FEATURES.md) | Every user-facing feature and how it behaves |
| [docs/API.md](docs/API.md) | Endpoints, request and response shapes, errors |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder layout, design decisions, how the MPA is built |

## Quick start

Requirements: Node.js 18.18 or newer. `better-sqlite3` v12 ships prebuilt binaries for current Node versions, including 22 and 24, so no C++ build tools are needed.

```bash
# 1. Install dependencies for both apps
npm run install:all

# 2. Terminal 1: start the API on http://localhost:4000
npm run dev:backend

# 3. Terminal 2: start the UI on http://localhost:5173
npm run dev:frontend
```

Open http://localhost:5173 (the home page). The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed.

### Run the tests

```bash
npm test            # or: cd backend && npm test
```

The tests use an in-memory SQLite database, so they never touch `todos.db`.

### Production build

```bash
npm run build                 # type-checks and builds backend (dist/) and frontend (frontend/dist)
cd backend && npm start       # API on :4000
cd frontend && npm run preview  # serves the built pages on :5173, proxying /api
```

### Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `4000` | Backend port |
| `DB_FILE` | `todos.db` | SQLite file path (use `:memory:` for a throwaway DB) |

## Pages

| URL | Page |
| --- | --- |
| `/` | Home: today's reminder, upcoming tasks, **Add task** button |
| `/add.html` | Add task: title, notes, due date, reminder time, priority, category |
| `/todos.html` | All tasks: search, filter, sort, complete, delete |
| `/todo.html?id=<id>` | Single task: full details, edit, complete, delete |

## Trying the API without the UI

- VS Code (REST Client extension): open `backend/api/todos.http` and click **Send Request**.
- Postman: import `backend/api/todo.postman_collection.json` (the `baseUrl` variable defaults to `http://localhost:4000`).
