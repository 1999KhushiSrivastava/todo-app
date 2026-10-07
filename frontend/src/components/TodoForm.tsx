import { useState } from "react";
import { CATEGORIES, type Category, type Priority, type TodoInput } from "../lib/types";

interface Props {
  initial?: Partial<TodoInput>;
  submitLabel: string;
  onSubmit: (values: TodoInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function TodoForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [category, setCategory] = useState<Category>(initial?.category ?? "personal");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? "");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        description,
        priority,
        category,
        dueDate: dueDate || null,
        // A time without a date makes no sense, so it is dropped
        dueTime: dueDate && dueTime ? dueTime : null,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field field-full">
        <span>What do you need to do?</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Book the venue" required autoFocus />
      </label>
      <label className="field field-full">
        <span>Notes (optional)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={4} />
      </label>
      <label className="field">
        <span>Due date</span>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label className="field">
        <span>Reminder time</span>
        <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} disabled={!dueDate} />
      </label>
      <label className="field">
        <span>Priority</span>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="field">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <div className="form-actions field-full">
        <button className="btn btn-primary" disabled={busy || !title.trim()}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
