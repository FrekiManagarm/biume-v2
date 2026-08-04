// apps/marketing/components/landing-v5/fonts.ts
import { Hanken_Grotesk } from "next/font/google";

export const landingV5Sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-landing-v5-sans",
  display: "swap",
});

export const landingV5FontVariables = [landingV5Sans.variable].join(" ");
