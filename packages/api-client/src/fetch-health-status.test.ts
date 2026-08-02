import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHealthStatus } from "./fetch-health-status";

describe("fetchHealthStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed health status on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", timestamp: "2026-08-01T00:00:00.000Z" }),
      }),
    );

    const result = await fetchHealthStatus("http://localhost:3000");

    expect(result).toEqual({ status: "ok", timestamp: "2026-08-01T00:00:00.000Z" });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );

    await expect(fetchHealthStatus("http://localhost:3000")).rejects.toThrow(
      "Health check request failed with status 500",
    );
  });

  it("throws when the response body fails schema validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "bogus" }) }),
    );

    await expect(fetchHealthStatus("http://localhost:3000")).rejects.toThrow();
  });
});
