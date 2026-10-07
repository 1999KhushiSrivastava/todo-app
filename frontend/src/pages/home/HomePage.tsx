import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Nav } from "../../components/Nav";
import { TaskRow } from "../../components/TaskRow";
import { api, errorMessage } from "../../lib/api";
import { byDue, formatTime, nowHHMM, relativeDay, todayISO } from "../../lib/format";
import type { Todo } from "../../lib/types";

const UPCOMING_LIMIT = 8;
const canNotify = () => typeof Notification !== "undefined";

export function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [permission, setPermission] = useState(canNotify() ? Notification.permission : "denied");
  const notified = useRef(new Set<number>());

  const load = useCallback(async () => {
    try {
      setTodos(await api.list({ status: "active" }));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const today = todayISO();
  const groups = useMemo(() => {
    const sorted = [...todos].sort(byDue);
    return {
      overdue: sorted.filter((t) => t.dueDate && t.dueDate < today),
      today: sorted.filter((t) => t.dueDate === today),
      upcoming: sorted.filter((t) => t.dueDate && t.dueDate > today),
      someday: sorted.filter((t) => !t.dueDate),
    };
  }, [todos, today]);
  const pending = [...groups.overdue, ...groups.today];

  // Desktop notifications: fire once per task when its reminder time arrives (while this tab is open).
  useEffect(() => {
    if (!canNotify() || permission !== "granted") return;
    const check = () => {
      const now = nowHHMM();
      groups.today
        .filter((t) => t.dueTime && t.dueTime <= now && !notified.current.has(t.id))
        .forEach((t) => {
          notified.current.add(t.id);
          new Notification("Task reminder", { body: `${t.title} (due ${formatTime(t.dueTime!)})` });
        });
    };
    check();
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, [groups.today, permission]);

  async function enableNotifications() {
    setPermission(await Notification.requestPermission());
  }

  async function mutate(fn: () => Promise<unknown>) {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const toggle = (t: Todo) => mutate(() => api.update(t.id, { completed: !t.completed }));

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <Nav active="home" />
      <main className="page">
        <header className="hero">
          <div>
            <p className="muted">{dateLabel}</p>
            <h1>Your day</h1>
          </div>
          <a className="btn btn-primary btn-lg" href="/add.html">Add task</a>
        </header>

        {error && <p role="alert" className="alert">{error}</p>}

        {!loading && pending.length > 0 && !dismissed && (
          <section className="reminder" aria-label="Reminder">
            <div className="reminder-head">
              <h2>
                Reminder: {pending.length} pending {pending.length === 1 ? "task" : "tasks"} for today
              </h2>
              <button className="btn btn-quiet btn-sm" onClick={() => setDismissed(true)}>Dismiss</button>
            </div>
            <ul className="list">
              {pending.map((t) => (
                <TaskRow key={t.id} todo={t} onToggle={toggle} showDate={false} />
              ))}
            </ul>
            {canNotify() && permission === "default" && (
              <button className="btn btn-sm" onClick={enableNotifications}>Turn on desktop reminders</button>
            )}
          </section>
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            {!error && pending.length === 0 && (
              <p className="all-clear">Nothing is pending for today.</p>
            )}

            <section aria-labelledby="upcoming-h" className="block">
              <div className="block-head">
                <h2 id="upcoming-h">Upcoming</h2>
                <a href="/todos.html">View all tasks</a>
              </div>
              {groups.upcoming.length === 0 ? (
                <p className="empty">
                  No upcoming tasks. <a href="/add.html">Add one with a due date</a> and it will show up here.
                </p>
              ) : (
                <>
                  <ul className="list">
                    {groups.upcoming.slice(0, UPCOMING_LIMIT).map((t) => (
                      <TaskRow key={t.id} todo={t} onToggle={toggle} />
                    ))}
                  </ul>
                  {groups.upcoming.length > UPCOMING_LIMIT && (
                    <p className="muted more">
                      + {groups.upcoming.length - UPCOMING_LIMIT} more, the next one is {relativeDay(groups.upcoming[UPCOMING_LIMIT].dueDate!)}. <a href="/todos.html">See all</a>
                    </p>
                  )}
                </>
              )}
            </section>

            {groups.someday.length > 0 && (
              <p className="muted more">
                {groups.someday.length} {groups.someday.length === 1 ? "task has" : "tasks have"} no due date. <a href="/todos.html">Review them</a>
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
