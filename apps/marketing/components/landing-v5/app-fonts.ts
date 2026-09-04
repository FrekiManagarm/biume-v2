/**
 * Les polices des maquettes de produit. Côté mobile, celles fixées par la
 * remise (`handoff/README.md`) : Bricolage Grotesque pour les titres, les
 * heures et le minuteur, Plus Jakarta Sans pour l'interface. Côté web, celle
 * de l'application praticien : Hanken Grotesk.
 *
 * Elles vivent dans leur propre module, et non dans `fonts.ts`, pour rester
 * hors de `fontVariables` : ce dernier est posé sur le `<body>` du layout
 * racine, donc sur toutes les pages du site. Déclarées ici, elles ne sont
 * préchargées que par les pages qui importent réellement une maquette.
 */
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Plus_Jakarta_Sans,
} from "next/font/google";

const appDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-biume-app-display",
  display: "swap",
});

const appSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-biume-app-sans",
  display: "swap",
});

/** L'application praticien tourne sur Hanken Grotesk (`packages/ui/src/styles/product.css`). */
const webSans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-biume-web-sans",
  display: "swap",
});

export const appFontVariables = [
  appDisplay.variable,
  appSans.variable,
  webSans.variable,
].join(" ");
