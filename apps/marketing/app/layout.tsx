import type { Metadata } from "next";

import { fontVariables } from "../components/landing-v5/fonts";
import { rootMetadata } from "../lib/metadata";
import "./globals.css";
import "../components/landing-v5/v2.css";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <body className={`v2 ${fontVariables}`}>{children}</body>
    </html>
  );
}
