import { fetchNotes, fetchProjects, fetchTasks } from "@mespace/api-client";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const [tasks, notes, projects] = await Promise.all([fetchTasks(), fetchNotes(), fetchProjects()]);

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ padding: "var(--space-md)", margin: 0 }}>Workspace</h1>
      <WorkspaceTabs tasks={tasks} notes={notes} projects={projects} />
    </main>
  );
}
