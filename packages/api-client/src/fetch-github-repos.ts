import type { Project } from "@mespace/core";

const GITHUB_API_BASE = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 10_000;
// A repo pushed within this window reads as "in-progress" rather than "done".
const RECENT_ACTIVITY_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

function toProject(repo: GithubRepo): Project {
  const isRecentlyActive = Date.now() - new Date(repo.pushed_at).getTime() < RECENT_ACTIVITY_WINDOW_MS;
  const tags = repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 4) : repo.language ? [repo.language] : [];

  return {
    id: `gh-${repo.id}`,
    title: repo.name,
    description: repo.description ?? "No description provided.",
    tags,
    status: isRecentlyActive ? "in-progress" : "done",
    published: true,
    repoUrl: repo.html_url,
    demoUrl: repo.homepage || undefined,
    updatedAt: repo.pushed_at,
  };
}

/**
 * Fetches a GitHub user's public, non-fork, non-archived repos and maps
 * them onto the same Project shape as the rest of the site, ranked by
 * stars then recent activity. Cached for an hour via Next's fetch Data
 * Cache to stay well under GitHub's unauthenticated rate limit.
 */
export async function fetchGithubRepos(username: string, limit = 6): Promise<Project[]> {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    // `next` is a Next.js fetch extension, absent from the DOM RequestInit type.
    next: { revalidate: 3600 },
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const repos = (await response.json()) as GithubRepo[];

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    )
    .slice(0, limit)
    .map(toProject);
}
