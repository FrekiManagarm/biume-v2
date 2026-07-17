import { describe, expect, test } from "bun:test";

import { UseMoments } from "../components/landing/use-moments";
import {
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("use moments", () => {
  test("shows three factual moments from the practitioner workflow", () => {
    const html = renderWithLandingImageConfig(<UseMoments />);
    const text = textOnly(html);

    for (const copy of [
      "Trois moments où Biume fait la différence.",
      "Rendre le compte rendu lisible",
      "Préparer le suivi après la séance",
      "Retrouver le fil à la prochaine consultation",
      "Rappel programmé pour le propriétaire",
    ]) {
      expect(text).toContain(copy);
    }

    expect(html).toContain("hero-practitioner-horse.png");
    expect(html.match(/data-use-moment=/g)).toHaveLength(3);
    expect(text).not.toContain("J+7");
    expect(text).not.toContain("Suivi ajouté à la timeline");
    expect(html).not.toContain("+40%");
    expect(html).not.toContain("témoignage");
  });
});
