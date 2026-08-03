import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "./project-card";

describe("ProjectCard", () => {
  it("renders the project title, description, and tags", () => {
    render(
      <ProjectCard
        project={{
          id: "p1",
          title: "MeSpace",
          description: "Personal branding and workspace app.",
          tags: ["nextjs"],
          status: "in-progress",
          published: true,
          updatedAt: "2026-08-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("MeSpace")).toBeInTheDocument();
    expect(screen.getByText("Personal branding and workspace app.")).toBeInTheDocument();
    expect(screen.getByText("#nextjs")).toBeInTheDocument();
  });
});
