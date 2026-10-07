# Features

The app has four pages. Moving between them is a normal browser navigation (multi-page app, not a single-page app).

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Today's reminder, upcoming tasks, and the **Add task** button |
| Add task | `/add.html` | Form for a new task |
| All tasks | `/todos.html` | Full list with search, filters and sorting |
| Task details | `/todo.html?id=<id>` | One task (the `id` query parameter picks which) |

## Home page (`/`)

| Feature | Behaviour |
| --- | --- |
| **Add task button** | Large button in the header (and in the top navigation) that opens the Add task page. |
| **Today's reminder** | A highlighted banner appears when there are open tasks due today, or overdue tasks from earlier days. It lists them, each with a checkbox to complete it on the spot. A **Dismiss** button hides the banner until the page is reloaded. |
| **All clear message** | When nothing is pending for today, the page says so. |
| **Upcoming** | Open tasks with a due date after today, ordered by date and then time, showing Today / Tomorrow / weekday and date. Shows the next 8 with a "+ N more" link. |
| **No-date notice** | A short line tells you how many open tasks have no due date, linking to the full list. |
| **Desktop reminders** | The banner offers **Turn on desktop reminders**. After you allow notifications, the browser shows a notification when a task's reminder time arrives (checked every 30 seconds while the home page is open, once per task). |
| **Complete in place** | Ticking a task's checkbox marks it done and refreshes the page data. |

## Add task page (`/add.html`)

| Field | Rules |
| --- | --- |
| Task title | Required, up to 200 characters |
| Notes | Optional, up to 2000 characters |
| Due date | Optional, defaults to today |
| Reminder time | Optional, only available once a date is chosen |
| Priority | Low, Medium (default) or High |
| Category | Personal (default), Work, Shopping, Health or Other |

**Save task** creates the task and returns to the home page. **Cancel** goes back without saving. Validation errors from the API are shown above the form.

## All tasks page (`/todos.html`)

| Feature | Behaviour |
| --- | --- |
| **Status tabs** | All, Active, Completed, each with a live count. |
| **Search** | Matches title or notes, case-insensitive, debounced by 250 ms. Done by the API. |
| **Priority and category filters** | Done by the API. |
| **Sorting** | Newest first (default), Due date (earliest first, then time; undated last), Priority (high first), Title (A to Z). Done by the API. |
| **Complete / delete** | Checkbox and Delete button on each row. |
| **Clear completed** | Removes every completed task in one request. |
| **Row details** | Priority badge, category chip, and due date and time. Overdue open tasks are shown in red. |
| **Empty states** | One message when you have no tasks at all, another when filters match nothing. |

## Task details page (`/todo.html?id=<id>`)

| Feature | Behaviour |
| --- | --- |
| **Details** | Title, priority, notes (line breaks kept), status, category, due date and time, created, last updated and completed times. |
| **Mark as done / Reopen** | Toggles completion in place. |
| **Edit** | Same form as the Add page. Clear the due date to remove it. |
| **Delete** | Asks for confirmation, then returns to All tasks. |
| **Error states** | A missing or non-numeric `id` shows a message; an unknown id shows "That task no longer exists." |

## Data model

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Auto-incremented |
| `title` | string | 1 to 200 characters, trimmed |
| `description` | string | Up to 2000 characters, default empty |
| `completed` | boolean | Default `false` |
| `priority` | `low` \| `medium` \| `high` | Default `medium` |
| `category` | `personal` \| `work` \| `shopping` \| `health` \| `other` | Default `personal` |
| `dueDate` | `YYYY-MM-DD` or `null` | Optional |
| `dueTime` | `HH:MM` (24-hour) or `null` | Optional reminder time |
| `createdAt`, `updatedAt` | ISO 8601 timestamp | Set by the server |
| `completedAt` | ISO 8601 timestamp or `null` | Set when completed, cleared when reopened |

## Backend capabilities

- Full CRUD plus bulk deletion of completed tasks.
- Filtering by status, free-text search, priority and category; sorting by four fields.
- Input validation with field-level error messages (Zod).
- Parameterised SQL; sort columns come from a fixed whitelist.
- Consistent JSON errors (`400` validation, `404` not found, `500` unexpected).
- SQLite persistence. Databases created by an earlier version are upgraded automatically on start (the `category` and `due_time` columns are added and existing rows get default values).

## Accessibility and UI details

- Keyboard-reachable controls with visible focus rings; the current page is marked in the navigation.
- Labels on every input; checkboxes and delete buttons announce the task they act on.
- Light and dark themes follow the operating-system setting.
- Responsive down to phone widths; animations respect reduced-motion settings.
