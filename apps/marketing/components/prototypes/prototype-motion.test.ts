import { describe, expect, test } from "bun:test";

const motionSource = await Bun.file(
  new URL("./prototype-motion.tsx", import.meta.url),
).text();
const globalsSource = await Bun.file(
  new URL("../../app/globals.css", import.meta.url),
).text();

describe("prototype motion", () => {
  test("keeps prototype motion isolated from globals", () => {
    expect(motionSource).not.toContain("useReducedMotion");
    expect(globalsSource).not.toContain(".prototype-action");
  });
});
