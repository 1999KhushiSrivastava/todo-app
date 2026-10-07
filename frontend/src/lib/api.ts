import type { ListParams, Todo, TodoInput } from "./types";

const BASE = "/api/todos";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path = "", init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      const details = (body.details ?? []) as { message: string }[];
      if (body.error) {
        message = details.length ? `${body.error}: ${details.map((d) => d.message).join(", ")}` : body.error;
      }
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  list(params: ListParams = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && qs.set(k, String(v)));
    const suffix = qs.toString();
    return request<Todo[]>(suffix ? `?${suffix}` : "");
  },
  get: (id: number) => request<Todo>(`/${id}`),
  create: (input: TodoInput) => request<Todo>("", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, patch: Partial<TodoInput & { completed: boolean }>) =>
    request<Todo>(`/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  remove: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
  clearCompleted: () => request<{ deleted: number }>("?completed=true", { method: "DELETE" }),
};

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
