import { z } from "zod";
import { CATEGORIES, PRIORITIES } from "./types.js";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD")
  .refine((v) => !Number.isNaN(Date.parse(v)), "dueDate is not a valid date");

const isoTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "dueTime must be HH:MM (24-hour)");

const fields = {
  title: z.string().trim().min(1, "title is required").max(200),
  description: z.string().max(2000),
  priority: z.enum(PRIORITIES),
  category: z.enum(CATEGORIES),
  dueDate: isoDate.nullable(),
  dueTime: isoTime.nullable(),
  completed: z.boolean(),
};

export const createTodoSchema = z.object({
  title: fields.title,
  description: fields.description.optional(),
  priority: fields.priority.optional(),
  category: fields.category.optional(),
  dueDate: fields.dueDate.optional(),
  dueTime: fields.dueTime.optional(),
  completed: fields.completed.optional(),
});

export const updateTodoSchema = createTodoSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export const listQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).optional(),
  q: z.string().trim().max(200).optional(),
  priority: fields.priority.optional(),
  category: fields.category.optional(),
  sort: z.enum(["createdAt", "dueDate", "priority", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const idSchema = z.coerce.number().int().positive();
