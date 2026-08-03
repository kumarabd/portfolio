import type { Task } from "@mespace/core";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-[var(--color-foreground)] transition-all duration-200"
        >
          <span>{task.title}</span>
          <span className="inline-block rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">
            {task.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
