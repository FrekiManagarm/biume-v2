import { describe, expect, test } from "bun:test";

const motionSource = await Bun.file(
  new URL("./prototype-motion.tsx", import.meta.url),
).text();
const globalsSource = await Bun.file(
  new URL("../../app/globals.css", import.meta.url),
).text();

describe("prototype motion", () => {
  test("does not disable immersive motion for reduced-motion preferences", () => {
    expect(motionSource).not.toContain("useReducedMotion");
    expect(motionSource).not.toContain("prefers-reduced-motion");
    expect(globalsSource).not.toContain(".prototype-action");
  });
});
