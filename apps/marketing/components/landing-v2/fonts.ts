import { Hanken_Grotesk } from "next/font/google";

/**
 * DESIGN.md fixe Hanken Grotesk comme unique famille, display et
 * corps confondus. Le contraste vient de l'échelle et de la densité,
 * pas d'un second caractère éditorial.
 *
 * Aucune monospace n'est chargée : les valeurs fonctionnelles
 * utilisent la pile système (`--lv2-mono`).
 */
export const lv2Sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-lv2-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const lv2FontVariables = lv2Sans.variable;
