import type { Metadata, Viewport } from "next";

import { fontVariables } from "../components/landing-v5/fonts";
import { rootMetadata } from "../lib/metadata";
import "./globals.css";
import "../components/landing-v5/v2.css";

export const metadata: Metadata = rootMetadata;

// Reprend --v2-canvas : la barre du navigateur mobile prolonge le fond du site.
export const viewport: Viewport = {
  themeColor: "#f7f6f2",
};

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
