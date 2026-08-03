import { TaskSchema, type Task } from "@mespace/core";
import { MOCK_TASKS } from "./mocks/tasks";

export async function fetchTasks(): Promise<Task[]> {
  return TaskSchema.array().parse(MOCK_TASKS);
}
