import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const evaluationSource = readFileSync(
  new URL("./tabs/AnatomicalEvaluationTab.tsx", import.meta.url),
  "utf8",
);
const visualizationSource = readFileSync(
  new URL("./AnatomicalVisualization.tsx", import.meta.url),
  "utf8",
);
const overlaySource = readFileSync(
  new URL("./AnatomicalImageWithOverlay.tsx", import.meta.url),
  "utf8",
);

describe("anatomy rendering invariants", () => {
  test("keeps the calibrated coordinate system in both renderers", () => {
    expect(evaluationSource).toContain('viewBox="0 0 500 380"');
    expect(visualizationSource).toContain('viewBox="0 0 500 380"');
    expect(evaluationSource).toContain(
      'preserveAspectRatio="xMidYMid meet"',
    );
    expect(visualizationSource).toContain(
      'preserveAspectRatio="xMidYMid meet"',
    );
  });

  test("keeps image and overlay in the same positioned wrapper", () => {
    expect(overlaySource).toContain("max-w-5xl mx-auto relative");
    expect(overlaySource).toContain("object-contain w-full h-auto");
    expect(evaluationSource).toContain(
      "absolute top-0 left-0 w-full h-full pointer-events-none",
    );
  });

  test("keeps left, right, and bilateral issues on their calibrated views", () => {
    expect(evaluationSource).toContain(
      'if (dysfunction.laterality === "bilateral") return true;',
    );
    expect(evaluationSource).toContain(
      'anatomicalView === "gauche" && dysfunction.laterality === "left"',
    );
    expect(evaluationSource).toContain(
      'anatomicalView === "droite" && dysfunction.laterality === "right"',
    );
    expect(visualizationSource).toContain(
      'if (issue.laterality === "bilateral") return true;',
    );
    expect(visualizationSource).toContain(
      'anatomicalView === "gauche" && issue.laterality === "left"',
    );
    expect(visualizationSource).toContain(
      'anatomicalView === "droite" && issue.laterality === "right"',
    );
  });
});
