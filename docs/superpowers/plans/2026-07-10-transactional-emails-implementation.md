# Transactional Emails Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Biume transactional email a consistent, warm editorial design built from the approved logo and colour system.

**Architecture:** `EmailLayout` owns the document shell, 56 px logo header, footer and responsive-safe surface. A new `EmailComponents` module exposes the small reusable blocks that templates compose: title, CTA, information/success cards, detail rows, support note and fallback URL. Existing template props and business URLs are kept intact.

**Tech Stack:** React 19, React Email components, TypeScript, Bun test runner, `react-dom/server`.

---

## File structure

- Create: `packages/transactional/emails/EmailComponents.tsx` — inline-style email primitives and palette.
- Create: `packages/transactional/emails/EmailLayout.test.tsx` — static-rendering visual contract tests.
- Modify: `packages/transactional/emails/EmailLayout.tsx` — brand and security shells.
- Modify: `packages/transactional/package.json` — test and type-check scripts.
- Modify: all sixteen functional templates under `packages/transactional/emails/`.
- Delete: `packages/transactional/emails/email.tsx` — unused example that bypasses the layout.
- Modify: `packages/transactional/emails/index.ts` — public exports.

### Task 1: Establish rendering tests and package commands

**Files:**
- Create: `packages/transactional/emails/EmailLayout.test.tsx`
- Modify: `packages/transactional/package.json`

- [ ] **Step 1: Write the failing shell test**

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { EmailLayout } from "./EmailLayout";

describe("EmailLayout", () => {
  test("renders the approved Biume logo, colour and preview", () => {
    const html = renderToStaticMarkup(
      <EmailLayout preview="Prévisualisation Biume">
        <p>Contenu</p>
      </EmailLayout>,
    );

    expect(html).toContain("https://biume.com/brand/biume-logo.png");
    expect(html).toContain('width="56"');
    expect(html).toContain("#8E82E8");
    expect(html).toContain("Prévisualisation Biume");
  });
});
```

- [ ] **Step 2: Add the commands and verify red**

Set `scripts.test` to `bun test` and `scripts.check-types` to `tsc --noEmit`.

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL because the current layout still renders the Imgur logo at width 48.

- [ ] **Step 3: Commit the red test**

```bash
git add packages/transactional/package.json packages/transactional/emails/EmailLayout.test.tsx
git commit -m "test: define transactional email visual contract"
```

### Task 2: Implement the shared shell and primitives

**Files:**
- Create: `packages/transactional/emails/EmailComponents.tsx`
- Modify: `packages/transactional/emails/EmailLayout.tsx`
- Modify: `packages/transactional/emails/EmailLayout.test.tsx`

- [ ] **Step 1: Write the failing primitive assertion**

```tsx
import { EmailAction, EmailSuccessCard } from "./EmailComponents";

test("uses lavender for actions and green only for confirmations", () => {
  const html = renderToStaticMarkup(
    <>
      <EmailAction href="https://biume.com/dashboard">Ouvrir Biume</EmailAction>
      <EmailSuccessCard title="Paiement confirmé">Merci.</EmailSuccessCard>
    </>,
  );

  expect(html).toContain("#8E82E8");
  expect(html).toContain("#2BDC8F");
  expect(html).toContain("Paiement confirmé");
});
```

- [ ] **Step 2: Verify red**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL with module-not-found for `./EmailComponents`.

- [ ] **Step 3: Implement the palette, action and success card**

```tsx
export const emailColors = {
  lavender: "#8E82E8",
  lavenderSurface: "#F3F0FC",
  green: "#2BDC8F",
  ink: "#3A3A3A",
  muted: "#746F78",
  border: "#E8E4EE",
} as const;

export function EmailAction({ href, children, tone = "primary" }: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "ink";
}) {
  return <Button href={href} style={{ backgroundColor: tone === "ink" ? emailColors.ink : emailColors.lavender, borderRadius: "7px", color: "#FFFFFF", display: "inline-block", fontSize: "14px", fontWeight: "700", padding: "12px 16px", textDecoration: "none" }}>{children}</Button>;
}

export function EmailSuccessCard({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return <Section style={{ backgroundColor: "#ECFBF3", border: `1px solid \${emailColors.green}`, borderRadius: "10px", padding: "14px" }}><Text style={{ color: "#087252", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", margin: "0 0 4px", textTransform: "uppercase" }}>{title}</Text><Text style={{ color: emailColors.ink, fontSize: "14px", lineHeight: "21px", margin: "0" }}>{children}</Text></Section>;
}
```

Implement the same inline-style pattern for `EmailTitle`, `EmailInfoCard`, `EmailDetailRows`, `EmailSupportNote`, `EmailDivider`, `EmailFallbackUrl` and `EmailButtonRow`. `EmailDetailRows` takes `Array<{ label: string; value: React.ReactNode }>` and renders stacked rows; do not use flex/grid styles.

- [ ] **Step 4: Implement the layout**

Replace the current layout with `Body`, `Container`, `Head`, `Html`, `Img`, `Preview`, `Section` and `Text` only. It renders a 600 px container, a lavender brand header, `https://biume.com/brand/biume-logo.png` at `width="56"`, a white content surface and a compact footer. Retain `preview?: string`; add `tone?: "brand" | "security"`, with the security header set to `#3A3A3A`. Remove `Tailwind`, all bespoke media CSS, social SVGs and the Imgur asset.

- [ ] **Step 5: Verify green and commit**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: PASS with both tests.

```bash
git add packages/transactional/emails/EmailLayout.tsx packages/transactional/emails/EmailComponents.tsx packages/transactional/emails/EmailLayout.test.tsx
git commit -m "feat: add Biume transactional email design system"
```

### Task 3: Migrate engagement templates

**Files:**
- Modify: `WelcomeBiumeEmail.tsx`, `TrialStartEmail.tsx`, `TrialFollowUpEmail.tsx`, `TrialReminderEmail.tsx`, `TrialEndingReminderEmail.tsx`, `TrialEndingOrg.tsx`, `UpgradeSubscription.tsx`, `DowngradeSubscription.tsx`
- Test: `packages/transactional/emails/EmailLayout.test.tsx`

- [ ] **Step 1: Write the failing trial assertion**

```tsx
import { TrialStartEmail } from "./TrialStartEmail";

test("renders a Biume trial start email with an active-trial confirmation", () => {
  const html = renderToStaticMarkup(
    <TrialStartEmail organizationName="Clinique Biume" trialEndDate={new Date("2026-07-25T00:00:00Z")} contactEmail="bonjour@biume.com" />,
  );

  expect(html).toContain("Votre essai gratuit est activé");
  expect(html).toContain("#2BDC8F");
  expect(html).toContain("Accéder à mon espace");
});
```

- [ ] **Step 2: Verify red**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL because the current email does not contain the confirmation copy or green card.

- [ ] **Step 3: Migrate the eight templates**

For each file, replace utility classes, emoji hierarchy, gradients and nested containers with `EmailTitle`, `EmailInfoCard`, `EmailSuccessCard`, `EmailDetailRows`, `EmailAction`, `EmailDivider` and `EmailSupportNote`. Preserve every prop, date calculation and existing dashboard/billing URL.

Use this exact shape for trial-start:

```tsx
<EmailLayout preview="Bienvenue dans votre période d’essai gratuite Biume">
  <EmailTitle eyebrow="Votre espace Biume">Tout est prêt pour démarrer.</EmailTitle>
  <Text style={bodyText}>Bonjour {organizationName},</Text>
  <EmailSuccessCard title="Votre essai gratuit est activé">
    Vous profitez de toutes les fonctionnalités jusqu’au {formattedDate}.
  </EmailSuccessCard>
  <EmailAction href={`\${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>Accéder à mon espace</EmailAction>
  <EmailSupportNote email={contactEmail}>Une question ? Notre équipe est là pour vous accompagner.</EmailSupportNote>
</EmailLayout>
```

Use the green card only for trial activation and subscription upgrade. `DowngradeSubscription` uses a neutral lavender card. Translate static English copy in Welcome, Upgrade and Downgrade templates into French.

- [ ] **Step 4: Verify green and commit**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx && bun --filter @biume/transactional check-types`

Expected: PASS.

```bash
git add packages/transactional/emails/{WelcomeBiumeEmail,TrialStartEmail,TrialFollowUpEmail,TrialReminderEmail,TrialEndingReminderEmail,TrialEndingOrg,UpgradeSubscription,DowngradeSubscription}.tsx packages/transactional/emails/EmailLayout.test.tsx
git commit -m "feat: redesign engagement emails"
```

### Task 4: Migrate operational and billing templates

**Files:**
- Modify: `AppointmentNotificationEmail.tsx`, `ReportReminderEmail.tsx`, `NewReportClientEmail.tsx`, `SubscriptionReceiptEmail.tsx`, `ContactEmail.tsx`
- Test: `packages/transactional/emails/EmailLayout.test.tsx`

- [ ] **Step 1: Write failing operational assertions**

```tsx
import AppointmentNotificationEmail from "./AppointmentNotificationEmail";
import SubscriptionReceiptEmail from "./SubscriptionReceiptEmail";

test("renders appointment details without flex-only layout", () => {
  const html = renderToStaticMarkup(<AppointmentNotificationEmail clientName="Camille" petName="Nala" appointmentDate={new Date("2026-07-10T00:00:00Z")} appointmentTime="10:00" duration={30} atHome={false} />);
  expect(html).toContain("Détails du rendez-vous");
  expect(html).toContain("Nala");
  expect(html).not.toContain("display:flex");
});

test("renders amount and next billing date on a subscription receipt", () => {
  const html = renderToStaticMarkup(<SubscriptionReceiptEmail customerName="Camille" planName="Pro" amount={29} currency="EUR" transactionId="txn_123" date={new Date("2026-07-10T00:00:00Z")} nextBillingDate={new Date("2026-08-10T00:00:00Z")} />);
  expect(html).toContain("29,00 €");
  expect(html).toContain("10 août 2026");
});
```

- [ ] **Step 2: Verify red**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL because `SubscriptionReceiptEmail` currently discards amount, currency, date and next-billing-date props.

- [ ] **Step 3: Migrate all five templates**

Use `EmailDetailRows` for appointment, reminder, contact sender and receipt details. Keep appointment note and home-location branches. Give NewReport one lavender CTA. Format receipt amounts with `new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount)` and dates with `format(value, "d MMMM yyyy", { locale: fr })`. Place the success card only in the receipt:

```tsx
<EmailSuccessCard title="Paiement confirmé">
  Votre abonnement {planName} a bien été renouvelé.
</EmailSuccessCard>
```

- [ ] **Step 4: Verify green and commit**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx && bun --filter @biume/transactional check-types`

Expected: PASS.

```bash
git add packages/transactional/emails/{AppointmentNotificationEmail,ReportReminderEmail,NewReportClientEmail,SubscriptionReceiptEmail,ContactEmail}.tsx packages/transactional/emails/EmailLayout.test.tsx
git commit -m "feat: redesign operational emails"
```

### Task 5: Migrate security and access templates

**Files:**
- Modify: `ResetPassword.tsx`, `OrganizationInvitation.tsx`, `AskMedicalRecordAccess.tsx`
- Test: `packages/transactional/emails/EmailLayout.test.tsx`

- [ ] **Step 1: Write the failing security assertion**

```tsx
import { ResetPassword } from "./ResetPassword";

test("uses the security shell and preserves a reset fallback URL", () => {
  const resetLink = "https://biume.com/reset-password/token";
  const html = renderToStaticMarkup(<ResetPassword resetLink={resetLink} username="Camille" />);
  expect(html).toContain("#3A3A3A");
  expect(html).toContain("Ce lien expire dans 24 heures.");
  expect(html).toContain(resetLink);
});
```

- [ ] **Step 2: Verify red**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL because the current reset email does not use the security tone or print a fallback URL.

- [ ] **Step 3: Migrate sensitive actions**

Use `<EmailLayout tone="security">` and `<EmailAction tone="ink">` in all three files. Put `EmailFallbackUrl` directly below each CTA. Preserve invitation and access URLs, professional name, animal name and justification. The medical-access email uses a neutral detail card and never a green success card. Translate remaining static English copy in reset and invitation templates into French.

- [ ] **Step 4: Verify green and commit**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx && bun --filter @biume/transactional check-types`

Expected: PASS.

```bash
git add packages/transactional/emails/{ResetPassword,OrganizationInvitation,AskMedicalRecordAccess}.tsx packages/transactional/emails/EmailLayout.test.tsx
git commit -m "feat: redesign security emails"
```

### Task 6: Remove the demo, align exports and verify the completed migration

**Files:**
- Delete: `packages/transactional/emails/email.tsx`
- Modify: `packages/transactional/emails/index.ts`
- Modify: `packages/transactional/emails/EmailLayout.test.tsx`

- [ ] **Step 1: Write the failing export smoke test**

```tsx
import { ContactEmail, TrialStartEmail, UpgradeSubscription } from "./index";

test("exports representative transactional templates", () => {
  expect(renderToStaticMarkup(<ContactEmail name="Camille" email="camille@example.com" message="Bonjour" />)).toContain("Nouveau message de contact");
  expect(renderToStaticMarkup(<TrialStartEmail organizationName="Biume" trialEndDate={new Date("2026-07-25T00:00:00Z")} contactEmail="bonjour@biume.com" />)).toContain("Votre essai gratuit est activé");
  expect(renderToStaticMarkup(<UpgradeSubscription plan="Pro" price="29" />)).toContain("Votre abonnement a été mis à jour");
});
```

- [ ] **Step 2: Verify red**

Run: `bun --filter @biume/transactional test EmailLayout.test.tsx`

Expected: FAIL because `ContactEmail` is not exported by the current barrel.

- [ ] **Step 3: Align public exports and remove the bypass**

Export `AppointmentNotificationEmail`, `AskMedicalRecordAccess`, `ContactEmail`, `DowngradeSubscription`, `NewReportClientEmail`, `OrganizationInvitation`, `ReportReminderEmail`, `ResetPassword`, `SubscriptionReceiptEmail`, `TrialEndingOrg`, `TrialEndingReminderEmail`, `TrialFollowUpEmail`, `TrialReminderEmail`, `TrialStartEmail`, `UpgradeSubscription` and `WelcomeBiume`. Delete `email.tsx`.

- [ ] **Step 4: Verify and review rendered email families**

Run: `bun --filter @biume/transactional test && bun --filter @biume/transactional check-types && bun run check-types`

Expected: all tests and type checks pass.

Run: `bun --filter @biume/transactional dev`

Manually verify a brand email, a receipt and a reset email: logo is 56 px, lavender drives brand actions, green is confirmation-only, security has an ink header and every sensitive action displays a fallback URL.

- [ ] **Step 5: Commit final cleanup**

```bash
git add packages/transactional/emails/index.ts packages/transactional/emails/EmailLayout.test.tsx packages/transactional/emails/email.tsx
git commit -m "chore: complete transactional email migration"
```

