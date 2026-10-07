# Architecture

```
todo-app/
├── README.md
├── docs/                       Documentation (this folder)
├── backend/
│   ├── api/                    todos.http (REST Client) + Postman collection
│   ├── src/
│   │   ├── server.ts           Process entry: opens the DB and starts listening
│   │   ├── app.ts              createApp(db): middleware, routes, error handler
│   │   ├── db.ts               SQLite connection, schema, upgrade of older databases
│   │   ├── routes/todos.ts     HTTP layer: parse, validate, call the service, shape responses
│   │   ├── services/todoService.ts   All SQL and business rules
│   │   ├── validation.ts       Zod schemas for bodies, queries and ids
│   │   ├── errors.ts           HttpError helper
│   │   └── types.ts            Shared domain types
│   └── tests/
│       ├── todoService.test.ts Unit tests (service + SQLite in memory)
│       └── todos.api.test.ts   HTTP tests with Supertest
└── frontend/
    ├── index.html              Entry: home (reminders + upcoming)
    ├── add.html                Entry: add task
    ├── todos.html              Entry: all tasks
    ├── todo.html               Entry: task details
    ├── vite.config.ts          Declares both HTML files as build inputs, proxies /api
    └── src/
        ├── pages/home/         main.tsx + HomePage.tsx
        ├── pages/add/          main.tsx + AddPage.tsx
        ├── pages/list/         main.tsx + ListPage.tsx
        ├── pages/detail/       main.tsx + DetailPage.tsx
        ├── components/         Nav, TaskRow, TodoForm, PriorityBadge (shared)
        ├── lib/                api client, types, date helpers
        └── styles.css          Design tokens, light/dark themes
```

## Backend layers

1. **Routes** know about HTTP only. They validate input with Zod and translate "not found" into a 404.
2. **Service** (`TodoService`) owns every SQL statement and the rules, such as `completedAt` being set and cleared automatically.
3. **DB** is injected: `createApp(db)` takes a database handle, which is why the tests can run against `:memory:` without mocks.

Errors thrown anywhere (a `ZodError`, an `HttpError`, malformed JSON) are turned into consistent JSON by one error-handling middleware in `app.ts`.

## Why these choices

- **SQLite:** a real database (extra credit) with zero setup, and the data is one file.
- **`better-sqlite3`:** synchronous API keeps the service code simple, and it is fast for this scale.
- **Zod:** one schema gives runtime validation and clear per-field messages.
- **Vite MPA:** the assignment requires multiple pages rather than a single-page app. Each `.html` file is a separate entry with its own bundle, and links between pages are plain `<a href>` navigations. The details page reads its `id` from `window.location.search`.
- **Home screen grouping:** the home page fetches open tasks once and groups them in the browser into overdue, due today and upcoming, using the user's local date. This avoids the server having to know the user's timezone.
- **Reminders:** the banner is computed from the same data. Desktop notifications use the browser Notification API and only fire while the home page is open; they are a convenience, not a background service.
- **Schema upgrades:** `db.ts` checks `PRAGMA table_info` on start and adds missing columns, so an existing `todos.db` keeps working.
- **Status tabs filter client-side:** search, priority and sort go to the API, while the All/Active/Completed tabs filter that result so the three counts are always accurate. The API still supports `status` for other clients.

## Possible next steps

Pagination, recurring tasks, background push reminders (service worker), user accounts, optimistic UI updates, and Playwright end-to-end tests.
