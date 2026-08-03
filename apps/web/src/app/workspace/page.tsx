import { fetchNotes, fetchProjects, fetchTasks } from "@mespace/api-client";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const [tasks, notes, projects] = await Promise.all([fetchTasks(), fetchNotes(), fetchProjects()]);

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="m-0 px-4 pt-8 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
        Workspace
      </h1>
      <WorkspaceTabs tasks={tasks} notes={notes} projects={projects} />
    </main>
  );
}
