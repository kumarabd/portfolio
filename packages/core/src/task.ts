import { z } from "zod";

export const TaskStatusSchema = z.enum(["todo", "in-progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  status: TaskStatusSchema,
  dueDate: z.string().datetime().optional(),
  projectId: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
