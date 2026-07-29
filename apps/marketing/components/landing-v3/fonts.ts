import { Bricolage_Grotesque } from "next/font/google";

/**
 * Famille unique. Bricolage Grotesque est une grotesque variable à
 * axe optique : elle porte à la fois le corps de texte et un display
 * franchement caractériel, sans avoir à lui adjoindre un second
 * caractère.
 *
 * Départ assumé par rapport à DESIGN.md, qui fixe Hanken Grotesk pour
 * la direction actuelle. La v3 est une direction visuelle distincte ;
 * les couleurs de marque et leurs rôles sémantiques, eux, sont
 * conservés à l'identique.
 */
export const lv3Sans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lv3-sans",
  display: "swap",
  axes: ["opsz"],
});

export const lv3FontVariables = lv3Sans.variable;
