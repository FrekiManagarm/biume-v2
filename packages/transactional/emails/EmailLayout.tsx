import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { PropsWithChildren } from "react";

import { emailColors } from "./EmailComponents";

const logoUrl = "https://biume.com/brand/biume-logo.png";

export function EmailLayout({ children, preview, tone = "brand" }: PropsWithChildren<{ preview?: string; tone?: "brand" | "security" }>) {
  const headerColor = tone === "security" ? emailColors.ink : emailColors.lavender;

  return (
    <Tailwind>
    <Html lang="fr" dir="ltr">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body style={{ backgroundColor: "#F5F4F6", fontFamily: "Arial, sans-serif", margin: 0, padding: "24px 12px" }}>
        <Container style={{ margin: "0 auto", maxWidth: "600px" }}>
          <Section style={{ backgroundColor: headerColor, borderRadius: "14px 14px 0 0", padding: "18px 24px" }}>
            <Img src={logoUrl} alt="Biume" width="56" height="56" style={{ display: "block" }} />
          </Section>
          <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid ${emailColors.border}`, borderTop: 0, borderRadius: "0 0 14px 14px", padding: "30px 24px" }}>
            {children}
          </Section>
          <Section style={{ padding: "18px 16px 0", textAlign: "center" }}>
            <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "18px", margin: "0 0 4px" }}>Biume · Simplifier le soin animal</Text>
            <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "18px", margin: 0 }}>© {new Date().getFullYear()} Biume</Text>
          </Section>
        </Container>
      </Body>
    </Html>
    </Tailwind>
  );
}
