import { Geist_Mono, Instrument_Sans } from "next/font/google";

/**
 * Landing v4 — « Le banc d'essai ».
 *
 * Deux caractères, deux rôles stricts, aucune zone grise :
 *
 *  - Instrument Sans porte tout ce qui s'adresse à un humain : titres,
 *    corps, boutons. Grotesque variable à axe de chasse (`wdth`), elle
 *    a assez de caractère pour ne pas ressembler à un template et
 *    reste parfaitement neutre en lecture longue.
 *  - Geist Mono porte tout ce qui *annote* : cotes, numéros de section,
 *    étiquettes de champ, prix, notes techniques. C'est elle qui donne
 *    à la page son air de planche d'atelier.
 *
 * Départ complet des directions précédentes (Hanken Grotesk en v2,
 * Bricolage Grotesque en v3) : la v4 repart d'une base neutre.
 */
export const lv4Sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-lv4-sans",
  display: "swap",
  axes: ["wdth"],
});

export const lv4Mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-lv4-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const lv4FontVariables = `${lv4Sans.variable} ${lv4Mono.variable}`;
