import { IBM_Plex_Mono, Inter } from "next/font/google";

export const v2Sans = Inter({
  subsets: ["latin"],
  variable: "--font-v2-sans",
  display: "swap",
});

export const v2Mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-v2-mono",
  display: "swap",
});

export const v2FontVariables = [v2Sans.variable, v2Mono.variable].join(" ");
