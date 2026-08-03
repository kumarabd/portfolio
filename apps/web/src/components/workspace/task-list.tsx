import type { Task } from "@mespace/core";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      {tasks.map((task) => (
        <li key={task.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{task.title}</span>
          <span className="badge">{task.status}</span>
        </li>
      ))}
    </ul>
  );
}
