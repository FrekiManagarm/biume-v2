import { Geist, Geist_Mono } from "next/font/google";

export const v2Sans = Geist({
  subsets: ["latin"],
  variable: "--font-v2-sans",
  display: "swap",
});

export const v2Mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-v2-mono",
  display: "swap",
});

export const v2FontVariables = [v2Sans.variable, v2Mono.variable].join(" ");
