import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import type { DB } from "./db.js";
import { HttpError } from "./errors.js";
import { todosRouter } from "./routes/todos.js";
import { TodoService } from "./services/todoService.js";

export function createApp(db: DB) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/todos", todosRouter(new TodoService(db)));

  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, details: err.details });
      return;
    }
    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({ error: "Malformed JSON body" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
