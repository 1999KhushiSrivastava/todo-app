import { useEffect, useState } from "react";
import { Nav } from "../../components/Nav";
import { PriorityBadge } from "../../components/PriorityBadge";
import { TodoForm } from "../../components/TodoForm";
import { ApiError, api, errorMessage } from "../../lib/api";
import { formatDate, formatDateTime, formatTime, isOverdue } from "../../lib/format";
import { categoryLabel, type Todo, type TodoInput } from "../../lib/types";

// This page is opened as /todo.html?id=<todo id>
const rawId = new URLSearchParams(window.location.search).get("id");
const id = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;

export function DetailPage() {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(
    id === null ? "This link is missing a valid todo id. Open a task from the list." : null,
  );
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id === null) return;
    api
      .get(id)
      .then(setTodo)
      .catch((e) => setError(e instanceof ApiError && e.status === 404 ? "That task no longer exists." : errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  async function save(patch: Partial<TodoInput & { completed: boolean }>) {
    try {
      setTodo(await api.update(id!, patch));
      setError(null);
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function remove() {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.remove(id!);
      window.location.href = "/todos.html";
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
    <Nav />
    <main className="page page-narrow">
      <a className="back" href="/todos.html">Back to all tasks</a>

      {loading && <p className="muted">Loading…</p>}
      {error && <p role="alert" className="alert">{error}</p>}

      {todo && !editing && (
        <article className="card detail">
          <div className="detail-head">
            <h1 className={todo.completed ? "done" : ""}>{todo.title}</h1>
            <PriorityBadge priority={todo.priority} />
          </div>

          <p className={todo.description ? "detail-desc" : "muted"}>{todo.description || "No notes added."}</p>

          <dl className="facts">
            <dt>Status</dt>
            <dd>{todo.completed ? "Done" : isOverdue(todo) ? "Open, overdue" : "Open"}</dd>
            <dt>Category</dt>
            <dd>{categoryLabel(todo.category)}</dd>
            <dt>Due</dt>
            <dd>
              {todo.dueDate ? formatDate(todo.dueDate) : "No due date"}
              {todo.dueDate && todo.dueTime ? ` at ${formatTime(todo.dueTime)}` : ""}
            </dd>
            <dt>Created</dt>
            <dd>{formatDateTime(todo.createdAt)}</dd>
            <dt>Last updated</dt>
            <dd>{formatDateTime(todo.updatedAt)}</dd>
            {todo.completedAt && (
              <>
                <dt>Completed</dt>
                <dd>{formatDateTime(todo.completedAt)}</dd>
              </>
            )}
          </dl>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => save({ completed: !todo.completed })}>
              {todo.completed ? "Reopen" : "Mark as done"}
            </button>
            <button className="btn" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={remove}>Delete</button>
          </div>
        </article>
      )}

      {todo && editing && (
        <section className="card" aria-label="Edit task">
          <TodoForm initial={todo} submitLabel="Save changes" onSubmit={save} onCancel={() => setEditing(false)} />
        </section>
      )}
    </main>
    </>
  );
}
