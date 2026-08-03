import { ProjectSchema, type Project } from "@mespace/core";
import { MOCK_PROJECTS } from "./mocks/projects";

export async function fetchProjects(): Promise<Project[]> {
  return ProjectSchema.array().parse(MOCK_PROJECTS);
}
