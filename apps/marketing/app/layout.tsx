import type { Metadata } from "next";

import { v2FontVariables } from "../components/v2/fonts";
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
      <body className={`v2 ${v2FontVariables}`}>{children}</body>
    </html>
  );
}
