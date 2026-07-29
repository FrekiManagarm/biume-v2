import { Atmosphere } from "./atmosphere";
import { Boundaries } from "./boundaries";
import { Close } from "./close";
import { Control } from "./control";
import { Facts } from "./facts";
import { Faq } from "./faq";
import { lv4FontVariables } from "./fonts";
import { FollowUp } from "./follow-up";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Masthead } from "./masthead";
import { MotionRoot } from "./motion";
import { PhotoPlate } from "./photo-plate";
import { Pricing } from "./pricing";
import { Specimen } from "./specimen";

/**
 * Landing v4 — « La nuit clinique ».
 *
 * Une nuit organique : des noirs aubergine, une lumière veloutée qui
 * glisse sur le pelage, et les trois couleurs de Biume comme signaux —
 * le violet décide, le bleu relie, le vert confirme.
 *
 * La page alterne deux régimes. Les plans photographiques sont des
 * scènes de soin : on y voit le geste, jamais un décor. Les plans
 * produit sont sombres et nets : on y voit le document, jamais une
 * capture encadrée façon navigateur. Le battement entre les deux est
 * la structure — on ne lit pas une brochure, on traverse une séance.
 *
 * Tout le défilement est amorti, et trois couches se déplacent à des
 * vitesses distinctes : la photo à 0.6, le produit à 1, les
 * annotations un peu au-dessus. La profondeur vient de là.
 *
 *   Ouverture      la praticienne et le cheval, pleine hauteur
 *   Le relevé      la démonstration, volets suspendus au scroll
 *   Le constat     pourquoi la réécriture coûte cher
 *   ─ plan photo   la main sur le pelage
 *   Le contrôle    un brouillon incomplet, envoi fermé
 *   ─ plan photo   le compte rendu expliqué au propriétaire
 *   Le suivi       le fil bleu qui se trace après la séance
 *   Les limites    ce que Biume ne fait pas
 *   Tarifs         une formule, deux rythmes
 *   Questions      puis la clôture et le pied de page
 */
export function LandingV4() {
  return (
    <MotionRoot className={`lv4 ${lv4FontVariables} min-h-[100dvh]`}>
      <Atmosphere />
      <Masthead />
      <main id="contenu" tabIndex={-1} className="relative">
        <Hero />
        <Specimen />
        <Facts />

        <PhotoPlate
          src="/assets/images/landing/practitioner-dog.png"
          alt="Une ostéopathe animalière, les deux mains posées sur le dos d'un chien endormi sur la table de soin."
          eyebrow="Ce que vos notes racontent"
          line="Vingt minutes de gestes tiennent en huit lignes d'abréviations."
          attribution="Le propriétaire, lui, n'était pas dans la pièce."
          position="42% 58%"
        />

        <Control />

        <PhotoPlate
          src="/assets/images/landing/practitioner-owner-animal.png"
          alt="Une ostéopathe animalière assise au sol explique la séance à la propriétaire, le chien allongé entre elles."
          eyebrow="Ce que le propriétaire retient"
          line="Ce que vous expliquez en partant, il l'aura oublié le soir."
          attribution="Le compte rendu prend le relais."
          position="50% 46%"
        />

        <FollowUp />
        <Boundaries />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </MotionRoot>
  );
}
