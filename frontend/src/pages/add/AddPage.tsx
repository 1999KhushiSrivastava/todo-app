import { useState } from "react";
import { Nav } from "../../components/Nav";
import { TodoForm } from "../../components/TodoForm";
import { api, errorMessage } from "../../lib/api";
import { todayISO } from "../../lib/format";
import type { TodoInput } from "../../lib/types";

export function AddPage() {
  const [error, setError] = useState<string | null>(null);

  async function create(values: TodoInput) {
    try {
      await api.create(values);
      window.location.href = "/"; // back to the home screen, where the new task shows up
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <Nav active="add" />
      <main className="page page-narrow">
        <h1>Add a task</h1>
        <p className="muted lead">Pick a due date to see it under Upcoming. Tasks due today appear as a reminder on the home screen.</p>
        {error && <p role="alert" className="alert">{error}</p>}
        <section className="card" aria-label="New task">
          <TodoForm
            initial={{ dueDate: todayISO() }}
            submitLabel="Save task"
            onSubmit={create}
            onCancel={() => (window.location.href = "/")}
          />
        </section>
      </main>
    </>
  );
}
