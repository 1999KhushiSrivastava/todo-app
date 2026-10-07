import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDb } from "../src/db.js";
import { TodoService } from "../src/services/todoService.js";

describe("category and due time", () => {
  let service: TodoService;
  beforeEach(() => {
    service = new TodoService(createDb(":memory:"));
  });

  it("defaults category to personal and dueTime to null", () => {
    expect(service.create({ title: "a" })).toMatchObject({ category: "personal", dueTime: null });
  });

  it("stores and updates category and dueTime", () => {
    const t = service.create({ title: "a", category: "work", dueDate: "2030-01-01", dueTime: "09:30" });
    expect(t).toMatchObject({ category: "work", dueTime: "09:30" });
    const u = service.update(t.id, { category: "health", dueTime: null })!;
    expect(u).toMatchObject({ category: "health", dueTime: null });
  });

  it("filters by category", () => {
    service.create({ title: "a", category: "work" });
    service.create({ title: "b", category: "shopping" });
    expect(service.list({ category: "work" }).map((t) => t.title)).toEqual(["a"]);
  });

  it("orders by due date, then due time", () => {
    service.create({ title: "late", dueDate: "2030-01-01", dueTime: "18:00" });
    service.create({ title: "untimed", dueDate: "2030-01-01" });
    service.create({ title: "early", dueDate: "2030-01-01", dueTime: "08:00" });
    expect(service.list({ sort: "dueDate" }).map((t) => t.title)).toEqual(["early", "late", "untimed"]);
  });
});

describe("API validation for the new fields", () => {
  const api = () => request(createApp(createDb(":memory:")));

  it("accepts valid category and dueTime", async () => {
    const res = await api().post("/api/todos").send({ title: "x", category: "work", dueTime: "23:59" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ category: "work", dueTime: "23:59" });
  });

  it("rejects unknown categories and malformed times", async () => {
    expect((await api().post("/api/todos").send({ title: "x", category: "fun" })).status).toBe(400);
    expect((await api().post("/api/todos").send({ title: "x", dueTime: "25:00" })).status).toBe(400);
    expect((await api().post("/api/todos").send({ title: "x", dueTime: "9:5" })).status).toBe(400);
  });

  it("rejects an unknown category filter", async () => {
    expect((await api().get("/api/todos?category=fun")).status).toBe(400);
  });
});

describe("migration of an older database file", () => {
  const dir = mkdtempSync(join(tmpdir(), "todo-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("adds the new columns and keeps existing rows", () => {
    const file = join(dir, "old.db");
    const old = new Database(file);
    old.exec(`CREATE TABLE todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0, priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, completed_at TEXT)`);
    old.prepare("INSERT INTO todos (title, created_at, updated_at) VALUES ('legacy', 'x', 'x')").run();
    old.close();

    const db = createDb(file);
    const rows = new TodoService(db).list();
    expect(rows[0]).toMatchObject({ title: "legacy", category: "personal", dueTime: null });
    db.close();
  });
});
