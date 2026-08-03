import { describe, expect, it } from "vitest";
import { fetchNotes } from "./fetch-notes";

describe("fetchNotes", () => {
  it("returns a non-empty list of valid notes", async () => {
    const notes = await fetchNotes();

    expect(notes.length).toBeGreaterThan(0);
  });
});
