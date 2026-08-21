import { Geist, Geist_Mono } from "next/font/google";

export const sans = Geist({
  subsets: ["latin"],
  variable: "--font-v2-sans",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-v2-mono",
  display: "swap",
});

export const fontVariables = [sans.variable, mono.variable].join(" ");