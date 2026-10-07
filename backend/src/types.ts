export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORIES = ["personal", "work", "shopping", "health", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  /** ISO date (YYYY-MM-DD) or null */
  dueDate: string | null;
  /** 24-hour time (HH:MM) or null */
  dueTime: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string | null;
  dueTime?: string | null;
  completed?: boolean;
}

export type UpdateTodoInput = Partial<CreateTodoInput>;

export type StatusFilter = "all" | "active" | "completed";
export type SortField = "createdAt" | "dueDate" | "priority" | "title";

export interface ListFilters {
  status?: StatusFilter;
  q?: string;
  priority?: Priority;
  category?: Category;
  sort?: SortField;
  order?: "asc" | "desc";
}
