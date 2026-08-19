import { describe, expect, test } from "bun:test";

import { LandingV5ReportTabs } from "../components/landing-v5/report-tabs";
import { SPECIMEN_STEPS, TABS_NOTE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("LandingV5ReportTabs", () => {
  test("renders a real tablist with one tab per step, no simulated span roles", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);

    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(SPECIMEN_STEPS.length);
    expect(html).not.toMatch(/<span[^>]*role="tab"/);
  });

  test("shows the first step's raw and rewritten text by default, and the demo disclaimer", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);
    const text = textOnly(html);

    expect(text).toContain(SPECIMEN_STEPS[0]!.raw);
    expect(text).toContain(SPECIMEN_STEPS[0]!.out);
    expect(text).toContain(TABS_NOTE);
  });

  test("labels every tab with its step label", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);
    const text = textOnly(html);

    for (const step of SPECIMEN_STEPS) {
      expect(text).toContain(step.label);
    }
  });
});
