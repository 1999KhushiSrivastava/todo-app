import { formatTime, isOverdue, relativeDay } from "../lib/format";
import { categoryLabel, type Todo } from "../lib/types";
import { PriorityBadge } from "./PriorityBadge";

interface Props {
  todo: Todo;
  onToggle: (t: Todo) => void;
  onDelete?: (t: Todo) => void;
  /** Show the due date next to the time (list views); hide it when the section already says "Today" */
  showDate?: boolean;
}

export function TaskRow({ todo: t, onToggle, onDelete, showDate = true }: Props) {
  const overdue = isOverdue(t);
  return (
    <li className={`item item-${t.priority}${t.completed ? " item-done" : ""}`}>
      <input
        type="checkbox"
        className="check"
        checked={t.completed}
        aria-label={`Mark "${t.title}" as ${t.completed ? "open" : "done"}`}
        onChange={() => onToggle(t)}
      />
      <div className="item-main">
        {/* A normal link: opening a task is a real navigation to the details page */}
        <a className="item-title" href={`/todo.html?id=${t.id}`}>{t.title}</a>
        <div className="item-meta">
          <PriorityBadge priority={t.priority} />
          <span className="chip">{categoryLabel(t.category)}</span>
          {t.dueDate && (
            <span className={overdue ? "overdue" : "muted"}>
              {overdue && "Overdue · "}
              {showDate || overdue ? relativeDay(t.dueDate) : ""}
              {t.dueTime ? `${showDate || overdue ? " · " : ""}${formatTime(t.dueTime)}` : ""}
            </span>
          )}
        </div>
      </div>
      {onDelete && (
        <button className="btn btn-quiet" onClick={() => onDelete(t)} aria-label={`Delete "${t.title}"`}>Delete</button>
      )}
    </li>
  );
}
