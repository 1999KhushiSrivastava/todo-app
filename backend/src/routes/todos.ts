import { Router, type Request, type Response } from "express";
import type { TodoService } from "../services/todoService.js";
import { notFound } from "../errors.js";
import {
  createTodoSchema,
  idSchema,
  listQuerySchema,
  updateTodoSchema,
} from "../validation.js";

export function todosRouter(service: TodoService): Router {
  const router = Router();
  const parseId = (req: Request) => idSchema.parse(req.params.id);

  // List (optional filters: status, q, priority, sort, order)
  router.get("/", (req, res) => {
    res.json(service.list(listQuerySchema.parse(req.query)));
  });

  // Bulk delete completed todos
  router.delete("/", (req, res) => {
    if (req.query.completed !== "true") {
      res.status(400).json({ error: "Use DELETE /api/todos?completed=true to clear completed todos" });
      return;
    }
    res.json({ deleted: service.clearCompleted() });
  });

  // Read one
  router.get("/:id", (req, res) => {
    const todo = service.get(parseId(req));
    if (!todo) throw notFound("Todo");
    res.json(todo);
  });

  // Create
  router.post("/", (req, res) => {
    res.status(201).json(service.create(createTodoSchema.parse(req.body)));
  });

  // Update (PATCH and PUT both accept partial bodies)
  const update = (req: Request, res: Response) => {
    const todo = service.update(parseId(req), updateTodoSchema.parse(req.body));
    if (!todo) throw notFound("Todo");
    res.json(todo);
  };
  router.patch("/:id", update);
  router.put("/:id", update);

  // Delete one
  router.delete("/:id", (req, res) => {
    if (!service.delete(parseId(req))) throw notFound("Todo");
    res.status(204).end();
  });

  return router;
}
