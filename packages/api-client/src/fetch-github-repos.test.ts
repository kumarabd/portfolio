import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGithubRepos } from "./fetch-github-repos";

const RECENT_REPO = {
  id: 1,
  name: "queuelite",
  description: "A tiny job queue.",
  html_url: "https://github.com/kumarabd/queuelite",
  homepage: "https://queuelite.example.com",
  topics: ["postgresql", "node"],
  language: "TypeScript",
  stargazers_count: 12,
  pushed_at: new Date().toISOString(),
  fork: false,
  archived: false,
};

const OLD_REPO = {
  id: 2,
  name: "old-tool",
  description: null,
  html_url: "https://github.com/kumarabd/old-tool",
  homepage: null,
  topics: [],
  language: "Python",
  stargazers_count: 3,
  pushed_at: "2020-01-01T00:00:00.000Z",
  fork: false,
  archived: false,
};

const FORKED_REPO = { ...OLD_REPO, id: 3, name: "forked-repo", fork: true };
const ARCHIVED_REPO = { ...OLD_REPO, id: 4, name: "archived-repo", archived: true };

describe("fetchGithubRepos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps repos onto the Project shape, ranked by stars", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [OLD_REPO, RECENT_REPO],
      }),
    );

    const result = await fetchGithubRepos("kumarabd");

    expect(result[0]).toMatchObject({
      id: "gh-1",
      title: "queuelite",
      description: "A tiny job queue.",
      tags: ["postgresql", "node"],
      status: "in-progress",
      published: true,
      repoUrl: "https://github.com/kumarabd/queuelite",
      demoUrl: "https://queuelite.example.com",
    });
    expect(result[1]).toMatchObject({ id: "gh-2", status: "done" });
  });

  it("excludes forked and archived repos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [OLD_REPO, FORKED_REPO, ARCHIVED_REPO],
      }),
    );

    const result = await fetchGithubRepos("kumarabd");

    expect(result.map((p) => p.title)).toEqual(["old-tool"]);
  });

  it("falls back to the primary language when there are no topics", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [OLD_REPO] }),
    );

    const result = await fetchGithubRepos("kumarabd");

    expect(result[0].tags).toEqual(["Python"]);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(fetchGithubRepos("kumarabd")).rejects.toThrow(
      "GitHub API request failed with status 403",
    );
  });
});
