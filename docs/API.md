# REST API

Base URL: `http://localhost:4000`. All bodies are JSON.

## Todo object

```json
{
  "id": 1,
  "title": "Prepare assignment",
  "description": "Backend + frontend",
  "completed": false,
  "priority": "high",
  "category": "work",
  "dueDate": "2026-12-31",
  "dueTime": "09:30",
  "createdAt": "2026-10-05T08:30:00.000Z",
  "updatedAt": "2026-10-05T08:30:00.000Z",
  "completedAt": null
}
```

## Endpoints

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | Liveness check | `200 {"status":"ok"}` |
| GET | `/api/todos` | List todos (with optional filters) | `200` array |
| GET | `/api/todos/:id` | Get one todo | `200` todo |
| POST | `/api/todos` | Create a todo | `201` todo |
| PATCH | `/api/todos/:id` | Partially update a todo | `200` todo |
| PUT | `/api/todos/:id` | Same behaviour as PATCH (partial body accepted) | `200` todo |
| DELETE | `/api/todos/:id` | Delete one todo | `204` no body |
| DELETE | `/api/todos?completed=true` | Delete all completed todos | `200 {"deleted": n}` |

### `GET /api/todos` query parameters

| Param | Values | Default |
| --- | --- | --- |
| `status` | `all`, `active`, `completed` | `all` |
| `q` | Text matched against title and description | none |
| `priority` | `low`, `medium`, `high` | none |
| `category` | `personal`, `work`, `shopping`, `health`, `other` | none |
| `sort` | `createdAt`, `dueDate`, `priority`, `title` | `createdAt` |
| `order` | `asc`, `desc` | `desc` for the default sort, otherwise `asc` |

Example: `GET /api/todos?status=active&priority=high&category=work&sort=dueDate&order=asc`

`sort=dueDate` orders by date, then time, with undated tasks last.

### `POST /api/todos`

| Field | Required | Rules |
| --- | --- | --- |
| `title` | yes | 1 to 200 characters after trimming |
| `description` | no | up to 2000 characters |
| `priority` | no | `low`, `medium` or `high` |
| `category` | no | `personal` (default), `work`, `shopping`, `health` or `other` |
| `dueDate` | no | `YYYY-MM-DD` or `null` |
| `dueTime` | no | 24-hour `HH:MM` or `null` (for example `09:30`, `23:59`) |
| `completed` | no | boolean |

### `PATCH /api/todos/:id`

Same fields as create, all optional, but at least one must be present. Send `"dueDate": null` (or `"dueTime": null`) to remove it. Setting `completed` to `true` stamps `completedAt`; setting it to `false` clears it.

## Errors

Every error is JSON with an `error` message.

| Status | When | Example |
| --- | --- | --- |
| 400 | Validation failed, bad id, malformed JSON, bad query value | `{"error":"Validation failed","details":[{"field":"title","message":"title is required"}]}` |
| 404 | Todo or route does not exist | `{"error":"Todo not found"}` |
| 500 | Unexpected server error | `{"error":"Internal server error"}` |

## Try it

```bash
curl -X POST localhost:4000/api/todos -H 'Content-Type: application/json' \
  -d '{"title":"Write docs","priority":"high","dueDate":"2026-12-31"}'

curl 'localhost:4000/api/todos?status=active&sort=priority'
curl -X PATCH localhost:4000/api/todos/1 -H 'Content-Type: application/json' -d '{"completed":true}'
curl -X DELETE localhost:4000/api/todos/1
```

Ready-made requests: `backend/api/todos.http` (REST Client) and `backend/api/todo.postman_collection.json` (Postman).
