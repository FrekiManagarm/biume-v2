import { ScrollRead } from "./motion";

/**
 * Chapitre 01 — le seul endroit de la page où le mouvement est piloté
 * au scroll.
 *
 * Le texte passe de l'encre « pas encore lue » à l'encre pleine au fil
 * de la traversée : le lecteur éprouve exactement ce que le produit
 * promet, un propos qui devient clair. Le contenu est la démonstration
 * elle-même, pas une accroche.
 *
 * Inspiration : « Text Scroll Read » (@youcefbnm, 21st.dev), dont
 * l'état non lu a été remonté de 1.85:1 à 3.06:1 — voir motion.tsx.
 */
const MANIFESTO =
  "Vous notez « restriction thoracique gauche ». Le propriétaire lit « la mobilité du thorax a été travaillée pendant la séance ». Même observation, deux lecteurs. Biume écrit la seconde phrase. Vous gardez la première.";

export function Manifesto() {
  return (
    <section
      id="lecture"
      aria-labelledby="lv3-lecture-title"
      className="scroll-mt-24 bg-[color:var(--lv3-canvas)]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-32 md:px-8 md:py-44">
        {/* Le plan du document a besoin d'un titre ; la page, elle, n'a
            besoin que du texte. */}
        <h2 id="lv3-lecture-title" className="sr-only">
          Ce que le propriétaire lit
        </h2>
        <ScrollRead
          text={MANIFESTO}
          className="lv3-manifesto mx-auto max-w-[24ch] [text-wrap:balance] md:max-w-[26ch]"
        />
      </div>
    </section>
  );
}
