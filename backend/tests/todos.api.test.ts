import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDb } from "../src/db.js";

let api: ReturnType<typeof request>;
beforeEach(() => {
  api = request(createApp(createDb(":memory:")));
});

describe("POST /api/todos", () => {
  it("creates a todo (201)", async () => {
    const res = await api.post("/api/todos").send({ title: "  Learn Vite ", priority: "high" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: "Learn Vite", priority: "high", completed: false });
  });

  it("rejects an empty title (400)", async () => {
    const res = await api.post("/api/todos").send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe("title");
  });

  it("rejects bad priority and bad date", async () => {
    expect((await api.post("/api/todos").send({ title: "x", priority: "urgent" })).status).toBe(400);
    expect((await api.post("/api/todos").send({ title: "x", dueDate: "tomorrow" })).status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const res = await api.post("/api/todos").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/todos", () => {
  it("lists and filters", async () => {
    await api.post("/api/todos").send({ title: "one" });
    await api.post("/api/todos").send({ title: "two", completed: true });
    expect((await api.get("/api/todos")).body).toHaveLength(2);
    expect((await api.get("/api/todos?status=completed")).body).toHaveLength(1);
    expect((await api.get("/api/todos?q=tw")).body[0].title).toBe("two");
  });

  it("rejects an invalid filter value", async () => {
    expect((await api.get("/api/todos?status=nope")).status).toBe(400);
  });
});

describe("GET /api/todos/:id", () => {
  it("returns the todo", async () => {
    const { body } = await api.post("/api/todos").send({ title: "x" });
    const res = await api.get(`/api/todos/${body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("x");
  });

  it("404 when missing, 400 when id is invalid", async () => {
    expect((await api.get("/api/todos/42")).status).toBe(404);
    expect((await api.get("/api/todos/abc")).status).toBe(400);
  });
});

describe("PATCH/PUT /api/todos/:id", () => {
  it("updates fields", async () => {
    const { body } = await api.post("/api/todos").send({ title: "x" });
    const res = await api.patch(`/api/todos/${body.id}`).send({ completed: true, description: "done" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ completed: true, description: "done" });
    expect(res.body.completedAt).not.toBeNull();
  });

  it("rejects an empty body and 404s for a missing todo", async () => {
    const { body } = await api.post("/api/todos").send({ title: "x" });
    expect((await api.patch(`/api/todos/${body.id}`).send({})).status).toBe(400);
    expect((await api.put("/api/todos/999").send({ title: "y" })).status).toBe(404);
  });
});

describe("DELETE", () => {
  it("deletes one todo (204) then 404", async () => {
    const { body } = await api.post("/api/todos").send({ title: "x" });
    expect((await api.delete(`/api/todos/${body.id}`)).status).toBe(204);
    expect((await api.delete(`/api/todos/${body.id}`)).status).toBe(404);
  });

  it("clears completed todos", async () => {
    await api.post("/api/todos").send({ title: "a", completed: true });
    await api.post("/api/todos").send({ title: "b" });
    const res = await api.delete("/api/todos?completed=true");
    expect(res.body).toEqual({ deleted: 1 });
    expect((await api.get("/api/todos")).body).toHaveLength(1);
  });

  it("requires completed=true for bulk delete", async () => {
    expect((await api.delete("/api/todos")).status).toBe(400);
  });
});

it("GET /api/health", async () => {
  expect((await api.get("/api/health")).body).toEqual({ status: "ok" });
});
