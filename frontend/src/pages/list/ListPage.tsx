import { useCallback, useEffect, useMemo, useState } from "react";
import { Nav } from "../../components/Nav";
import { TaskRow } from "../../components/TaskRow";
import { api, errorMessage } from "../../lib/api";
import { CATEGORIES, type Category, type Priority, type SortField, type Todo } from "../../lib/types";

type Status = "all" | "active" | "completed";

export function ListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // debounced search
  const [priority, setPriority] = useState<Priority | "">("");
  const [category, setCategory] = useState<Category | "">("");
  const [sort, setSort] = useState<SortField>("createdAt");

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Search, priority, category and sorting are done by the API; the status tabs
  // filter this result client-side so the tab counts stay accurate.
  const load = useCallback(async () => {
    try {
      const order = sort === "createdAt" || sort === "priority" ? "desc" : "asc";
      setTodos(
        await api.list({ q: q || undefined, priority: priority || undefined, category: category || undefined, sort, order }),
      );
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q, priority, category, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  async function mutate(fn: () => Promise<unknown>) {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos],
  );
  const visible = todos.filter((t) => status === "all" || (status === "completed") === t.completed);
  const filtered = !!(q || priority || category);

  return (
    <>
      <Nav active="todos" />
      <main className="page">
        <header className="page-head">
          <h1>All tasks</h1>
          <p className="muted">{counts.active} open · {counts.completed} done</p>
        </header>

        <section aria-label="Filters" className="toolbar">
          <div className="tabs" role="tablist">
            {(["all", "active", "completed"] as Status[]).map((s) => (
              <button key={s} role="tab" aria-selected={status === s} className={status === s ? "tab tab-on" : "tab"} onClick={() => setStatus(s)}>
                {s[0].toUpperCase() + s.slice(1)} <span className="muted">{counts[s]}</span>
              </button>
            ))}
          </div>
          <input type="search" className="search" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search tasks" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | "")} aria-label="Filter by priority">
            <option value="">Any priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category | "")} aria-label="Filter by category">
            <option value="">Any category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortField)} aria-label="Sort by">
            <option value="createdAt">Newest first</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </section>

        {error && <p role="alert" className="alert">{error}</p>}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="empty">
            {todos.length === 0 && !filtered ? (
              <>No tasks yet. <a href="/add.html">Add your first task</a>.</>
            ) : (
              "No tasks match these filters."
            )}
          </p>
        ) : (
          <ul className="list">
            {visible.map((t) => (
              <TaskRow
                key={t.id}
                todo={t}
                onToggle={(x) => mutate(() => api.update(x.id, { completed: !x.completed }))}
                onDelete={(x) => mutate(() => api.remove(x.id))}
              />
            ))}
          </ul>
        )}

        {counts.completed > 0 && (
          <button className="btn btn-quiet clear" onClick={() => mutate(() => api.clearCompleted())}>
            Clear {counts.completed} completed
          </button>
        )}
      </main>
    </>
  );
}
