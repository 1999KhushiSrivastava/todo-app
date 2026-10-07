import { beforeEach, describe, expect, it } from "vitest";
import { createDb } from "../src/db.js";
import { TodoService } from "../src/services/todoService.js";

let service: TodoService;
beforeEach(() => {
  service = new TodoService(createDb(":memory:"));
});

describe("TodoService", () => {
  it("creates a todo with defaults", () => {
    const t = service.create({ title: "Write docs" });
    expect(t).toMatchObject({
      id: 1,
      title: "Write docs",
      description: "",
      completed: false,
      priority: "medium",
      dueDate: null,
      completedAt: null,
    });
  });

  it("sets and clears completedAt when toggling completion", () => {
    const t = service.create({ title: "A" });
    const done = service.update(t.id, { completed: true })!;
    expect(done.completed).toBe(true);
    expect(done.completedAt).not.toBeNull();
    expect(service.update(t.id, { completed: false })!.completedAt).toBeNull();
  });

  it("partially updates and can clear dueDate with null", () => {
    const t = service.create({ title: "A", dueDate: "2030-01-01", priority: "high" });
    const u = service.update(t.id, { title: "B", dueDate: null })!;
    expect(u).toMatchObject({ title: "B", dueDate: null, priority: "high" });
  });

  it("returns undefined / false for missing ids", () => {
    expect(service.get(99)).toBeUndefined();
    expect(service.update(99, { title: "x" })).toBeUndefined();
    expect(service.delete(99)).toBe(false);
  });

  it("filters by status, priority and search text", () => {
    service.create({ title: "Buy milk", priority: "low" });
    service.create({ title: "Pay rent", priority: "high", completed: true });
    service.create({ title: "Call mom", description: "about milk run" });

    expect(service.list({ status: "completed" }).map((t) => t.title)).toEqual(["Pay rent"]);
    expect(service.list({ status: "active" })).toHaveLength(2);
    expect(service.list({ priority: "high" })).toHaveLength(1);
    expect(service.list({ q: "milk" })).toHaveLength(2);
  });

  it("sorts by priority and title", () => {
    service.create({ title: "b", priority: "low" });
    service.create({ title: "a", priority: "high" });
    service.create({ title: "c", priority: "medium" });
    expect(service.list({ sort: "priority", order: "desc" }).map((t) => t.title)).toEqual(["a", "c", "b"]);
    expect(service.list({ sort: "title" }).map((t) => t.title)).toEqual(["a", "b", "c"]);
  });

  it("sorts due dates with nulls last", () => {
    service.create({ title: "none" });
    service.create({ title: "late", dueDate: "2030-02-01" });
    service.create({ title: "soon", dueDate: "2030-01-01" });
    expect(service.list({ sort: "dueDate" }).map((t) => t.title)).toEqual(["soon", "late", "none"]);
  });

  it("clears completed todos", () => {
    service.create({ title: "a", completed: true });
    service.create({ title: "b" });
    expect(service.clearCompleted()).toBe(1);
    expect(service.list()).toHaveLength(1);
  });
});
