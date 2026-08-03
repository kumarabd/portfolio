import { describe, expect, it } from "vitest";
import { NoteSchema } from "./note";

describe("NoteSchema", () => {
  const valid = {
    id: "n1",
    title: "Idea",
    body: "Some note body.",
    tags: [],
    updatedAt: "2026-08-01T00:00:00.000Z",
  };

  it("accepts a valid note", () => {
    expect(NoteSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing body", () => {
    const { body, ...withoutBody } = valid;
    expect(NoteSchema.safeParse(withoutBody).success).toBe(false);
  });
});
