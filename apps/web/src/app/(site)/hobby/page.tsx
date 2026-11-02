import type { Metadata } from "next";
import type { Project } from "@mespace/core";
import { fetchGithubRepos, fetchProjects } from "@mespace/api-client";
import { WorldStage } from "@/components/world/world-stage";
import { hobbyScenes } from "@/components/worlds/hobby-scenes";
import { PROFILE } from "@/content/profile";

export const metadata: Metadata = { title: "Hobby — Abishek Kumar" };

export default async function HobbyPage() {
  let projects: Project[] = await fetchGithubRepos(PROFILE.githubUsername, 6).catch(() => []);
  if (!projects.length) projects = (await fetchProjects()).filter((p) => p.published);

  return (
    <main>
      <WorldStage realm="hobby" nav="pills" side={1} dim={0.15} scenes={hobbyScenes(projects)} />
    </main>
  );
}
