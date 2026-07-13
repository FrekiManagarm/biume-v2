import {
  Button,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

export const emailColors = {
  lavender: "#8E82E8",
  lavenderSurface: "#F3F0FC",
  green: "#2BDC8F",
  ink: "#3A3A3A",
  muted: "#746F78",
  border: "#E8E4EE",
} as const;

export const bodyText: CSSProperties = {
  color: emailColors.ink,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

export function EmailTitle({
  children,
  eyebrow,
}: PropsWithChildren<{ eyebrow?: string }>) {
  return (
    <Section style={{ margin: "0 0 24px" }}>
      {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
      <Text style={titleStyle}>{children}</Text>
    </Section>
  );
}

export function EmailAction({
  children,
  href,
  tone = "primary",
}: PropsWithChildren<{ href: string; tone?: "primary" | "ink" }>) {
  return (
    <Section style={{ margin: "24px 0", textAlign: "center" }}>
      <Button
        href={href}
        style={{
          ...buttonStyle,
          backgroundColor: tone === "ink" ? emailColors.ink : emailColors.lavender,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

export function EmailInfoCard({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return <EmailCard title={title}>{children}</EmailCard>;
}

export function EmailSuccessCard({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <Section style={{ ...cardStyle, backgroundColor: "#ECFBF3", borderColor: emailColors.green }}>
      <Text style={{ ...eyebrowStyle, color: "#087252" }}>{title}</Text>
      <Text style={{ ...bodyText, margin: 0 }}>{children}</Text>
    </Section>
  );
}

export function EmailCard({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <Section style={cardStyle}>
      <Text style={eyebrowStyle}>{title}</Text>
      <Text style={{ ...bodyText, margin: 0 }}>{children}</Text>
    </Section>
  );
}

export function EmailDetailRows({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <Section style={{ ...cardStyle, backgroundColor: "#FAF9FC" }}>
      {rows.map(({ label, value }, index) => (
        <Section key={label} style={{ borderBottom: index === rows.length - 1 ? "0" : `1px solid ${emailColors.border}`, padding: "0 0 10px", margin: index === rows.length - 1 ? "0" : "0 0 10px" }}>
          <Text style={{ color: emailColors.muted, fontSize: "12px", margin: "0 0 2px" }}>{label}</Text>
          <Text style={{ color: emailColors.ink, fontSize: "14px", fontWeight: "700", lineHeight: "20px", margin: 0 }}>{value}</Text>
        </Section>
      ))}
    </Section>
  );
}

export function EmailFallbackUrl({ href }: { href: string }) {
  return <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "18px", margin: "0 0 20px", overflowWrap: "anywhere" }}>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur : <Link href={href} style={{ color: emailColors.lavender }}>{href}</Link></Text>;
}

export function EmailDivider() { return <Hr style={{ borderColor: emailColors.border, margin: "24px 0" }} />; }

export function EmailSupportNote({ children, email }: PropsWithChildren<{ email?: string }>) {
  return <Text style={{ color: emailColors.muted, fontSize: "13px", lineHeight: "20px", margin: 0 }}>{children}{email ? <> <Link href={`mailto:${email}`} style={{ color: emailColors.lavender }}>{email}</Link></> : null}</Text>;
}

const titleStyle: CSSProperties = { color: emailColors.ink, fontSize: "28px", fontWeight: "700", letterSpacing: "-0.7px", lineHeight: "34px", margin: 0 };
const eyebrowStyle: CSSProperties = { color: "#6F63BB", fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", margin: "0 0 6px", textTransform: "uppercase" };
const buttonStyle: CSSProperties = { borderRadius: "7px", color: "#FFFFFF", display: "inline-block", fontSize: "14px", fontWeight: "700", padding: "12px 16px", textDecoration: "none" };
const cardStyle: CSSProperties = { backgroundColor: emailColors.lavenderSurface, border: `1px solid ${emailColors.border}`, borderRadius: "10px", margin: "20px 0", padding: "14px" };
