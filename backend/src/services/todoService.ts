import type { DB } from "../db.js";
import type {
  Category,
  CreateTodoInput,
  ListFilters,
  Priority,
  Todo,
  UpdateTodoInput,
} from "../types.js";

interface TodoRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  priority: Priority;
  category: Category;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const toTodo = (r: TodoRow): Todo => ({
  id: r.id,
  title: r.title,
  description: r.description,
  completed: r.completed === 1,
  priority: r.priority,
  category: r.category,
  dueDate: r.due_date,
  dueTime: r.due_time,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  completedAt: r.completed_at,
});

// Whitelisted ORDER BY expressions (user input is never interpolated into SQL)
const SORT_SQL = {
  createdAt: "created_at",
  dueDate: "(due_date IS NULL), due_date, (due_time IS NULL), due_time",
  priority: "CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END",
  title: "title COLLATE NOCASE",
} as const;

export class TodoService {
  constructor(private db: DB) {}

  list(f: ListFilters = {}): Todo[] {
    const where: string[] = [];
    const params: Record<string, unknown> = {};

    if (f.status === "active") where.push("completed = 0");
    if (f.status === "completed") where.push("completed = 1");
    if (f.priority) {
      where.push("priority = @priority");
      params.priority = f.priority;
    }
    if (f.category) {
      where.push("category = @category");
      params.category = f.category;
    }
    if (f.q) {
      where.push("(title LIKE @q OR description LIKE @q)");
      params.q = `%${f.q}%`;
    }

    const sort = SORT_SQL[f.sort ?? "createdAt"];
    const order = (f.order ?? (f.sort ? "asc" : "desc")) === "asc" ? "ASC" : "DESC";
    const sql = `SELECT * FROM todos ${where.length ? "WHERE " + where.join(" AND ") : ""}
                 ORDER BY ${sort} ${order}, id DESC`;
    return (this.db.prepare(sql).all(params) as TodoRow[]).map(toTodo);
  }

  get(id: number): Todo | undefined {
    const row = this.db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | undefined;
    return row && toTodo(row);
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();
    const completed = input.completed ?? false;
    const info = this.db
      .prepare(
        `INSERT INTO todos (title, description, completed, priority, category, due_date, due_time, created_at, updated_at, completed_at)
         VALUES (@title, @description, @completed, @priority, @category, @due_date, @due_time, @now, @now, @completed_at)`,
      )
      .run({
        title: input.title,
        description: input.description ?? "",
        completed: completed ? 1 : 0,
        priority: input.priority ?? "medium",
        category: input.category ?? "personal",
        due_date: input.dueDate ?? null,
        due_time: input.dueTime ?? null,
        now,
        completed_at: completed ? now : null,
      });
    return this.get(Number(info.lastInsertRowid))!;
  }

  update(id: number, patch: UpdateTodoInput): Todo | undefined {
    const current = this.get(id);
    if (!current) return undefined;

    const now = new Date().toISOString();
    const completed = patch.completed ?? current.completed;
    let completedAt = current.completedAt;
    if (completed && !current.completed) completedAt = now;
    if (!completed) completedAt = null;

    this.db
      .prepare(
        `UPDATE todos SET title=@title, description=@description, completed=@completed,
           priority=@priority, category=@category, due_date=@due_date, due_time=@due_time, updated_at=@now, completed_at=@completed_at
         WHERE id=@id`,
      )
      .run({
        id,
        title: patch.title ?? current.title,
        description: patch.description ?? current.description,
        completed: completed ? 1 : 0,
        priority: patch.priority ?? current.priority,
        category: patch.category ?? current.category,
        due_date: patch.dueDate === undefined ? current.dueDate : patch.dueDate,
        due_time: patch.dueTime === undefined ? current.dueTime : patch.dueTime,
        now,
        completed_at: completedAt,
      });
    return this.get(id);
  }

  delete(id: number): boolean {
    return this.db.prepare("DELETE FROM todos WHERE id = ?").run(id).changes > 0;
  }

  clearCompleted(): number {
    return this.db.prepare("DELETE FROM todos WHERE completed = 1").run().changes;
  }
}
