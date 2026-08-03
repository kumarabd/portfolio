import type { Note } from "@mespace/core";

export function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-[var(--color-foreground)] transition-all duration-200"
        >
          <h3 className="m-0 mb-1 text-sm font-semibold">{note.title}</h3>
          <p className="m-0 text-sm" style={{ fontFamily: "var(--font-fira-code)" }}>
            {note.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
