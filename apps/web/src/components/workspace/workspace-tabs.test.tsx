import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceTabs } from "./workspace-tabs";

describe("WorkspaceTabs", () => {
  const tasks = [{ id: "t1", title: "Write resume", status: "todo" as const }];
  const notes = [
    { id: "n1", title: "Idea", body: "Some note", tags: [], updatedAt: "2026-08-01T00:00:00.000Z" },
  ];
  const projects = [
    {
      id: "p1",
      title: "MeSpace",
      description: "desc",
      tags: [],
      status: "in-progress" as const,
      published: true,
      updatedAt: "2026-08-01T00:00:00.000Z",
    },
  ];

  it("shows the Tasks tab by default", () => {
    render(<WorkspaceTabs tasks={tasks} notes={notes} projects={projects} />);

    expect(screen.getByText("Write resume")).toBeInTheDocument();
  });

  it("switches to the Notes tab on click", () => {
    render(<WorkspaceTabs tasks={tasks} notes={notes} projects={projects} />);

    fireEvent.click(screen.getByRole("tab", { name: "Notes" }));

    expect(screen.getByText("Idea")).toBeInTheDocument();
  });
});
