import { AfterSession } from "./after-session";
import { Atelier } from "./atelier";
import { Close } from "./close";
import { Control } from "./control";
import { Faq } from "./faq";
import { lv2FontVariables } from "./fonts";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Masthead } from "./masthead";
import { MotionRoot } from "./motion";
import { Pricing } from "./pricing";

/**
 * Landing v2 — « La mécanique douce ».
 *
 * Un récit en cinq temps, une idée dominante par pli et une rupture de
 * fond au centre :
 *
 *   Hero        photographie plein cadre, composition asymétrique
 *   Atelier     la transformation jouée au scroll — la preuve du produit
 *   Contrôle    séquence sombre, surface produit construite en code
 *   Suivi       respiration photographique, fil bleu de continuité
 *   Tarifs → FAQ → Clôture
 */
export function LandingV2() {
  return (
    <MotionRoot className={`lv2 ${lv2FontVariables} min-h-[100dvh]`}>
      <Masthead />
      <main id="contenu" tabIndex={-1}>
        <Hero />
        <Atelier />
        <Control />
        <AfterSession />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </MotionRoot>
  );
}
