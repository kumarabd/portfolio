import { describe, expect, it } from "vitest";
import { allNodes } from "@/content/tree";
import { layout, openFor, overlaps } from "./layout";

describe("mind-map layout", () => {
  it("never overlaps two visible nodes, whichever node is open", () => {
    for (const n of allNodes()) {
      const boxes = [...layout(openFor(n.id)).values()];
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++)
          expect(overlaps(boxes[i], boxes[j]), `${n.id}: ${boxes[i].id} vs ${boxes[j].id}`).toBe(false);
    }
  });
});
