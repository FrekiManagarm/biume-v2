import { describe, expect, test } from "bun:test";

import { LandingV5FollowUp } from "../components/landing-v5/follow-up";
import { FOLLOW_UP } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 follow-up", () => {
  test("renders the eyebrow, title and all three milestones in order", () => {
    const html = renderWithLandingImageConfig(<LandingV5FollowUp />);
    const text = textOnly(html);

    expect(html).toContain('id="suivi"');
    expect(text).toContain("La séance continue sans que vous y pensiez.");
    const positions = FOLLOW_UP.map((milestone) => {
      expect(text).toContain(milestone.when);
      expect(text).toContain(milestone.title);
      expect(text).toContain(milestone.body);
      return text.indexOf(milestone.title);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("starts the thread fill at zero height", () => {
    const html = renderWithLandingImageConfig(<LandingV5FollowUp />);

    expect(html).toMatch(/style="[^"]*height:0/);
  });

  test("owns its own scrubbed scroll trigger for the thread, no window listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/follow-up.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).toContain("scrub: true");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });
});
