import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import sitemap from "../app/sitemap";
import AnimalibAlternativePage, {
  metadata as animalibMetadata,
} from "../app/alternatives/animalib/page";
import HunimalisAlternativePage, {
  metadata as hunimalisMetadata,
} from "../app/alternatives/hunimalis/page";
import MyPawScribeAlternativePage, {
  metadata as myPawScribeMetadata,
} from "../app/alternatives/mypawscribe/page";
import MyTourAlternativePage, {
  metadata as myTourMetadata,
} from "../app/alternatives/mytour/page";
import NeoVoiceComparisonPage, {
  metadata as neoVoiceMetadata,
} from "../app/comparatifs/neovoice-vs-biume/page";
import StenkoAlternativePage, {
  metadata as stenkoMetadata,
} from "../app/alternatives/stenko/page";
import ExampleReportPage, {
  metadata as exampleReportMetadata,
} from "../app/exemple-compte-rendu-osteopathie-animale/page";
import FollowUpPage, {
  metadata as followUpMetadata,
} from "../app/suivi-post-seance-animal/page";
import ReminderPage, {
  metadata as reminderMetadata,
} from "../app/relance-client-osteopathe-animalier/page";
import TemplateReportPage, {
  metadata as templateReportMetadata,
} from "../app/modele-compte-rendu-osteopathe-animalier/page";

const leverPages = [
  {
    path: "/modele-compte-rendu-osteopathe-animalier",
    Page: TemplateReportPage,
    metadata: templateReportMetadata,
    title: "Modèle compte rendu ostéopathe animalier",
    keywords: ["modèle compte rendu", "ostéopathe animalier", "résumé propriétaire"],
  },
  {
    path: "/exemple-compte-rendu-osteopathie-animale",
    Page: ExampleReportPage,
    metadata: exampleReportMetadata,
    title: "Exemple compte rendu ostéopathie animale",
    keywords: ["exemple de compte rendu", "ostéopathie animale", "points observés"],
  },
  {
    path: "/suivi-post-seance-animal",
    Page: FollowUpPage,
    metadata: followUpMetadata,
    title: "Suivi post-séance animal",
    keywords: ["suivi post-séance", "propriétaire", "évolution"],
  },
  {
    path: "/relance-client-osteopathe-animalier",
    Page: ReminderPage,
    metadata: reminderMetadata,
    title: "Relance client ostéopathe animalier",
    keywords: ["relance client", "ostéopathe animalier", "J+7"],
  },
  {
    path: "/alternatives/animalib",
    Page: AnimalibAlternativePage,
    metadata: animalibMetadata,
    title: "Alternative Animalib",
    keywords: ["alternative Animalib", "Biume", "suivi post-séance"],
  },
  {
    path: "/alternatives/stenko",
    Page: StenkoAlternativePage,
    metadata: stenkoMetadata,
    title: "Alternative Stenko",
    keywords: ["alternative Stenko", "Biume", "résumé propriétaire"],
  },
  {
    path: "/alternatives/hunimalis",
    Page: HunimalisAlternativePage,
    metadata: hunimalisMetadata,
    title: "Alternative Hunimalis",
    keywords: ["alternative Hunimalis", "Biume", "compte rendu propriétaire"],
  },
  {
    path: "/alternatives/mytour",
    Page: MyTourAlternativePage,
    metadata: myTourMetadata,
    title: "Alternative MyTour",
    keywords: ["alternative MyTour", "Biume", "suivi post-séance"],
  },
  {
    path: "/comparatifs/neovoice-vs-biume",
    Page: NeoVoiceComparisonPage,
    metadata: neoVoiceMetadata,
    title: "NeoVoice vs Biume",
    keywords: ["NeoVoice vs Biume", "suivi propriétaire", "praticien"],
  },
  {
    path: "/alternatives/mypawscribe",
    Page: MyPawScribeAlternativePage,
    metadata: myPawScribeMetadata,
    title: "Alternative MyPawScribe",
    keywords: ["alternative MyPawScribe", "Biume", "thérapeute animalier"],
  },
];

describe("SEO lever pages", () => {
  test.each(leverPages)("$path has focused metadata, copy, schema, and conversion hooks", ({
    Page,
    metadata,
    title,
    keywords,
  }) => {
    const html = renderToStaticMarkup(<Page />);

    expect(metadata.title).toBe(title);
    expect(String(metadata.description).length).toBeGreaterThan(120);
    expect(String(metadata.description).length).toBeLessThanOrEqual(170);
    expect(html).toContain("application/ld+json");
    expect(html).toContain("Essayer 15 jours gratuitement");
    for (const keyword of keywords) {
      expect(html.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  test("sitemap includes the SEO lever pages", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const page of leverPages) {
      expect(urls).toContain(`https://biume.com${page.path}`);
    }
  });
});
