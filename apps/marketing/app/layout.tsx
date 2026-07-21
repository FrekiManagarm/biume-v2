import type { Metadata } from "next";

import { rootMetadata } from "../lib/metadata";
import "./globals.css";
import "./v2/v2.css";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
