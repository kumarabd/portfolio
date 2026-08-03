import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  projectId: z.string().optional(),
  updatedAt: z.string().datetime(),
});

export type Note = z.infer<typeof NoteSchema>;
