import { describe, expect, it } from "vitest";
import { HealthStatusSchema } from "./health-status";

describe("HealthStatusSchema", () => {
  it("accepts a valid health status payload", () => {
    const result = HealthStatusSchema.safeParse({
      status: "ok",
      timestamp: "2026-08-01T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a payload with an invalid status value", () => {
    const result = HealthStatusSchema.safeParse({
      status: "unknown",
      timestamp: "2026-08-01T00:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});
