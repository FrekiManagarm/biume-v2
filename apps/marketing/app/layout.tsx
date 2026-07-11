import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { rootMetadata } from "../lib/metadata";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
