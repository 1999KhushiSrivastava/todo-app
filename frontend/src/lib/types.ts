export type Priority = "low" | "medium" | "high";
export type SortField = "createdAt" | "dueDate" | "priority" | "title";

export const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "shopping", label: "Shopping" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];
export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate: string | null;
  dueTime: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TodoInput {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  dueDate: string | null;
  dueTime: string | null;
}

export interface ListParams {
  status?: "all" | "active" | "completed";
  q?: string;
  priority?: Priority;
  category?: Category;
  sort?: SortField;
  order?: "asc" | "desc";
}
