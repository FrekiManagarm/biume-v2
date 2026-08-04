import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Faq } from "../components/landing-v5/faq";
import { FAQ } from "../components/landing-v5/content";
import { faqJsonLd } from "../lib/seo";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 faq", () => {
  test("renders all six questions and answers", () => {
    const html = renderWithLandingImageConfig(<LandingV5Faq />);
    const text = textOnly(html);

    expect(html).toContain('id="questions"');
    for (const item of FAQ) {
      expect(text).toContain(item.q);
      expect(text).toContain(item.a);
    }
  });

  test("opens an item on click, exposing it via aria-expanded", () => {
    const { container } = render(<LandingV5Faq />);
    const trigger = within(container).getByRole("button", { name: FAQ[0]!.q });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("faqJsonLd", () => {
  test("builds a FAQPage schema with one Question per entry", () => {
    const schema = faqJsonLd(FAQ);

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(FAQ.length);
    expect(schema.mainEntity[0]).toEqual({
      "@type": "Question",
      name: FAQ[0]!.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ[0]!.a },
    });
  });
});
