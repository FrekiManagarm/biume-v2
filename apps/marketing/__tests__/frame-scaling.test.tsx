import { describe, expect, test } from "bun:test";

import { computeFrameScale } from "../components/frames/phone-frame";

describe("computeFrameScale", () => {
  test("scales fixed-width content down to fit a smaller screen", () => {
    // Cadre de 200px de large, écran = 89.954% du cadre, contenu dessiné à 216px.
    const scale = computeFrameScale({
      containerWidth: 200,
      screenWidthRatio: 0.89954,
      contentWidth: 216,
    });
    // largeur d'écran réelle = 200 * 0.89954 = 179.908
    // scale = 179.908 / 216
    expect(scale).toBeCloseTo(179.908 / 216, 5);
  });

  test("scales fixed-width content up for a larger frame", () => {
    const scale = computeFrameScale({
      containerWidth: 1200,
      screenWidthRatio: 0.99751,
      contentWidth: 1120,
    });
    expect(scale).toBeCloseTo((1200 * 0.99751) / 1120, 5);
  });

  test("returns 0 for a zero-width container instead of dividing into NaN", () => {
    const scale = computeFrameScale({
      containerWidth: 0,
      screenWidthRatio: 0.9,
      contentWidth: 216,
    });
    expect(scale).toBe(0);
  });
});
