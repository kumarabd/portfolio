import { describe, expect, it } from "vitest";
import { allNodes } from "@/content/tree";
import { layout, openFor, overlaps } from "./layout";

describe("mind-map layout", () => {
  it("never overlaps two visible nodes, whichever node is open", () => {
    for (const n of allNodes()) {
      const boxes = [...layout(openFor(n.id), n.id).values()];
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++)
          expect(overlaps(boxes[i], boxes[j]), `${n.id}: ${boxes[i].id} vs ${boxes[j].id}`).toBe(false);
    }
  });

  it("leaves a dense branch to the panel on a narrow screen", () => {
    const dense = allNodes().find((n) => (n.children?.length ?? 0) > 6)!;
    const boxes = layout(openFor(dense.id), dense.id, "hide");
    for (const child of dense.children!) expect(boxes.has(child.id)).toBe(false);
  });
});
