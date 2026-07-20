import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  OrbitCaseRelay,
  OrbitDocumentStack,
  OrbitHeroMedia,
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

test("renders the remaining orbital sequence markers", () => {
  const hero = renderToStaticMarkup(
    <OrbitHeroMedia>
      <div>Le média du suivi.</div>
    </OrbitHeroMedia>,
  );
  const documents = renderToStaticMarkup(<OrbitDocumentStack />);
  const cases = renderToStaticMarkup(
    <OrbitCaseRelay items={[{ title: "Après le rendez-vous", body: "Le suivi reste lisible." }]} />,
  );

  expect(hero).toContain('data-orbit-hero="true"');
  expect(documents).toContain('data-orbit-documents="true"');
  expect(cases).toContain('data-orbit-cases="true"');
});

test("uses only motion-safe scroll primitives", async () => {
  const source = await Bun.file(
    "apps/marketing/components/prototypes/after-dark-orbit-motion.tsx",
  ).text();

  expect(source).toContain("useScroll");
  expect(source).not.toContain('addEventListener("scroll"');
  expect(source).not.toContain("useReducedMotion");
});
