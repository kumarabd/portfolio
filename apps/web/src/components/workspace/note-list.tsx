import type { Note } from "@mespace/core";

export function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      {notes.map((note) => (
        <li key={note.id} className="card">
          <h3 style={{ margin: "0 0 var(--space-xs) 0" }}>{note.title}</h3>
          <p style={{ margin: 0, fontFamily: "var(--font-fira-code)" }}>{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
