import { describe, expect, it } from "vitest";
import { fetchTasks } from "./fetch-tasks";

describe("fetchTasks", () => {
  it("returns a non-empty list of valid tasks", async () => {
    const tasks = await fetchTasks();

    expect(tasks.length).toBeGreaterThan(0);
  });
});
