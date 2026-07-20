import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";

export const v2Display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-v2-display",
  display: "swap",
});

export const v2Body = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-v2-body",
  display: "swap",
});

export const v2Mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-v2-mono",
  display: "swap",
});

export const v2FontVariables = [
  v2Display.variable,
  v2Body.variable,
  v2Mono.variable,
].join(" ");
