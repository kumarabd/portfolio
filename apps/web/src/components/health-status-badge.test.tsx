import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HealthStatusBadge } from "./health-status-badge";

describe("HealthStatusBadge", () => {
  it("renders the health status value", () => {
    render(<HealthStatusBadge status={{ status: "ok", timestamp: "2026-08-01T00:00:00.000Z" }} />);

    expect(screen.getByTestId("health-status-badge")).toHaveTextContent("API status: ok");
  });
});
