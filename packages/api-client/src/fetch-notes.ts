import { NoteSchema, type Note } from "@mespace/core";
import { MOCK_NOTES } from "./mocks/notes";

export async function fetchNotes(): Promise<Note[]> {
  return NoteSchema.array().parse(MOCK_NOTES);
}
