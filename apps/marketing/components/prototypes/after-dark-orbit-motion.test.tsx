import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  OrbitCaseRelay,
  OrbitDocumentStack,
  OrbitTrajectory,
} from "./after-dark-orbit-motion";

test("renders the trajectory stages and the orbital sequence markers", () => {
  const html = renderToStaticMarkup(
    <OrbitTrajectory stages={["Observer", "Clarifier", "Transmettre", "Suivre"]}>
      <p>Le texte de méthode reste lisible.</p>
    </OrbitTrajectory>,
  );

  expect(html).toContain('data-orbit-trajectory="true"');
  expect(html).toContain("Observer");
  expect(html).toContain("Suivre");
});

test("exports the document and case motion leaves", () => {
  expect(OrbitDocumentStack).toBeTypeOf("function");
  expect(OrbitCaseRelay).toBeTypeOf("function");
});

test("uses only motion-safe scroll primitives", async () => {
  const source = await Bun.file(
    "apps/marketing/components/prototypes/after-dark-orbit-motion.tsx",
  ).text();

  expect(source).toContain("useScroll");
  expect(source).not.toContain('addEventListener("scroll"');
  expect(source).not.toContain("useReducedMotion");
});
