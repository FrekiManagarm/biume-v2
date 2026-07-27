import { Atelier } from "./atelier";
import { ChapterRail } from "./chapter-rail";
import { Close } from "./close";
import { Control } from "./control";
import { Faq } from "./faq";
import { lv3FontVariables } from "./fonts";
import { FollowUp } from "./follow-up";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Manifesto } from "./manifesto";
import { Masthead } from "./masthead";
import { MotionRoot } from "./motion";
import { Pricing } from "./pricing";

/**
 * Landing v3 — « Le récit en chapitres ».
 *
 * Chaque chapitre est posé sur son propre plan de couleur pleine
 * largeur, pris uniquement dans les tons doux du système et
 * l'anthracite. Les accents saturés gardent leurs rôles : le violet
 * décide, le bleu relie, le vert confirme.
 *
 *   sombre    Hero — la photographie occupe tout le cadre
 *   toile     Manifeste — le texte devient lisible au scroll
 *   violet    L'atelier — vos mots, puis leur reformulation
 *   toile     Le contrôle — la surface produit, construite en code
 *   bleu      Le suivi — la continuité après la séance
 *   toile     Tarifs, puis questions
 *   sombre    Clôture — retour au plan d'ouverture
 */
export function LandingV3() {
  return (
    <MotionRoot className={`lv3 ${lv3FontVariables} min-h-[100dvh]`}>
      <Masthead />
      <ChapterRail />
      <main id="contenu" tabIndex={-1}>
        <Hero />
        <Manifesto />
        <Atelier />
        <Control />
        <FollowUp />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </MotionRoot>
  );
}
