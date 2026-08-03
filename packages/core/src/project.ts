import { z } from "zod";

export const ProjectStatusSchema = z.enum(["idea", "in-progress", "done"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  status: ProjectStatusSchema,
  published: z.boolean(),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;
