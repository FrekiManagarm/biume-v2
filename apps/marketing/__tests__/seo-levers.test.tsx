import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import sitemap from "../app/sitemap";
import AnimalibAlternativePage, {
  metadata as animalibMetadata,
} from "../app/alternatives/animalib/page";
import HunimalisAlternativePage, {
  metadata as hunimalisMetadata,
} from "../app/alternatives/hunimalis/page";
import KiwiAppliAlternativePage, {
  metadata as kiwiAppliMetadata,
} from "../app/alternatives/kiwiappli/page";
import MyPawScribeAlternativePage, {
  metadata as myPawScribeMetadata,
} from "../app/alternatives/mypawscribe/page";
import MyTourAlternativePage, {
  metadata as myTourMetadata,
} from "../app/alternatives/mytour/page";
import NeoVoiceAlternativePage, {
  metadata as neoVoiceAlternativeMetadata,
} from "../app/alternatives/neovoice/page";
import NeoVoiceComparisonPage, {
  metadata as neoVoiceMetadata,
} from "../app/comparatifs/neovoice-vs-biume/page";
import ComparisonHubPage from "../app/comparatifs/page";
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
    title: "Alternative à Animalib pour ostéopathe animalier",
    keywords: ["alternative Animalib", "Biume", "suivi post-séance"],
  },
  {
    path: "/alternatives/stenko",
    Page: StenkoAlternativePage,
    metadata: stenkoMetadata,
    title: "Alternative à Stenko pour ostéopathe animalier",
    keywords: ["alternative Stenko", "Biume", "résumé propriétaire"],
  },
  {
    path: "/alternatives/hunimalis",
    Page: HunimalisAlternativePage,
    metadata: hunimalisMetadata,
    title: "Alternative à Hunimalis pour ostéopathe animalier",
    keywords: ["alternative Hunimalis", "Biume", "compte rendu propriétaire"],
  },
  {
    path: "/alternatives/kiwiappli",
    Page: KiwiAppliAlternativePage,
    metadata: kiwiAppliMetadata,
    title: "Alternative à Kiwi Appli pour ostéopathe animalier",
    keywords: ["alternative Kiwi Appli", "Biume", "résumé propriétaire"],
  },
  {
    path: "/alternatives/mytour",
    Page: MyTourAlternativePage,
    metadata: myTourMetadata,
    title: "Alternative à MyTour pour ostéopathe animalier",
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
    path: "/alternatives/neovoice",
    Page: NeoVoiceAlternativePage,
    metadata: neoVoiceAlternativeMetadata,
    title: "Alternative à NeoVoice pour ostéopathe animalier",
    keywords: ["alternative NeoVoice", "migrer", "suivi post-séance"],
  },
  {
    path: "/alternatives/mypawscribe",
    Page: MyPawScribeAlternativePage,
    metadata: myPawScribeMetadata,
    title: "Alternative à MyPawScribe pour ostéopathe animalier",
    keywords: ["alternative MyPawScribe", "Biume", "thérapeute animalier"],
  },
];

describe("SEO lever pages", () => {
  test.each(leverPages)("$path has focused metadata, copy, schema, and conversion hooks", ({
    path,
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
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Accueil"');
    expect(html).toContain(`"item":"https://biume.com${path}"`);
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

  test("NeoVoice alternative page frames migration without referencing private shutdown information", () => {
    const html = renderToStaticMarkup(<NeoVoiceAlternativePage />);

    expect(html).toContain("changer d'outil");
    expect(html).toContain("continuité du suivi");
    expect(html).toContain("Préparer une transition");
    expect(html).not.toContain("31 août 2026");
    expect(html).not.toContain("message affiché aux utilisateurs");
    expect(html).toContain("/blog/migrer-depuis-neovoice-pro");
  });

  test("Kiwi Appli alternative page presents Biume as more than post-session follow-up", () => {
    const html = renderToStaticMarkup(<KiwiAppliAlternativePage />);

    expect(html).toContain("agenda");
    expect(html).toContain("propriétaires");
    expect(html).toContain("patients");
    expect(html).not.toContain("Biume se concentre sur le compte rendu propriétaire");
  });

  test("comparison pages present Biume as a complete practitioner workspace", () => {
    const pages = [
      ComparisonHubPage,
      AnimalibAlternativePage,
      HunimalisAlternativePage,
      KiwiAppliAlternativePage,
      MyPawScribeAlternativePage,
      MyTourAlternativePage,
      NeoVoiceAlternativePage,
      NeoVoiceComparisonPage,
      StenkoAlternativePage,
    ];
    const minimisingPhrases = [
      "Biume se concentre sur",
      "Biume ne cherche pas",
      "Biume ne remplace pas",
      "Biume est plus étroit",
      "Pas forcément. Biume peut compléter",
      "peut rester complémentaire",
      "sans changer votre agenda",
    ];

    for (const Page of pages) {
      const html = renderToStaticMarkup(<Page />);

      expect(html).toContain("agenda");
      expect(html).toContain("propriétaires");
      expect(html).toContain("patients");
      for (const phrase of minimisingPhrases) {
        expect(html).not.toContain(phrase);
      }
    }
  });
});
