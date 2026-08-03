import { describe, expect, it } from "vitest";
import { TaskSchema } from "./task";

describe("TaskSchema", () => {
  const valid = { id: "t1", title: "Write spec", status: "todo" };

  it("accepts a minimal valid task", () => {
    expect(TaskSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    expect(TaskSchema.safeParse({ ...valid, status: "blocked" }).success).toBe(false);
  });
});
