# Final landing review fix report

## Status and revision

- Status: DONE pending the commit recorded by the final handoff.
- Branch: `codex/marketing-soft-machine`.
- Starting SHA: `23958e355bd00e99f28580358a61336165434d8d`.
- Final SHA: the SHA of the commit containing this report is authoritative in
  the final handoff. A Git commit cannot embed its own SHA because changing the
  report changes that SHA.
- Commit message: `fix(marketing): address final landing review`.

## RED evidence

Tests and source/behavior contracts were changed before production code.

- The first focused run was
  `bun test apps/marketing/__tests__/landing-foundation.test.tsx apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/follow-up-flow.test.tsx apps/marketing/__tests__/use-moments.test.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/opengraph-image.test.ts apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/mobile-menu.test.ts`.
- Result: exit 1, 18 pass and 11 fail. The expected failures showed the old
  follow-up heading/steps, old timeline copy, missing skip link and focusable
  target, Hanken in the root layout instead of the landing shell, green pending
  styling, decorative OG green, the pricing shadow, and the missing mobile
  client island/dismissal function.
- The cleanup contract
  `expect(heroSource).not.toContain("adaptedProposal")` was then run separately
  against `landing-hero.test.tsx`; result: exit 1, 2 pass and 1 expected fail,
  with the unused prop still present in the source.

## GREEN implementation

- Added the first focusable `Aller au contenu` link before the header and made
  `main#contenu` programmatically focusable with `tabIndex={-1}`.
- Replaced the follow-up proof with the exact three-step factual sequence:
  `Compte rendu finalisé`, `Suivi préparé`, and `Rappel programmé`. The copy
  states that the practitioner chooses the reminder date and message. Only the
  final confirmed step uses green.
- Replaced the UseMoments timeline claim with `Rappel programmé pour le
  propriétaire` and removed the fixed J+7 presentation.
- Moved `Hanken_Grotesk` from the root layout into `LandingShell`; production
  output has one font preload on `/` and none on `/about`.
- Restyled pending `Prêt à relire` with violet-soft/violet, removed decorative
  green from the OG artwork while retaining the logo gradient, and removed the
  pricing surface shadow.
- Kept `LandingHeader` as a Server Component and added a minimal
  `MobileMenu` client wrapper. Its delegated click handler removes `open` only
  when the activation target is inside a link.
- Removed the unused hero prop and made the desktop source-order assertion
  prove that both component indices exist before comparing them.

The same focused command then passed with 29 tests, 259 expectations, and zero
failures.

## Files

Production:

- `apps/marketing/app/layout.tsx`
- `apps/marketing/app/page.tsx`
- `apps/marketing/app/opengraph-image.tsx`
- `apps/marketing/components/landing/landing-shell.tsx`
- `apps/marketing/components/landing/landing-header.tsx`
- `apps/marketing/components/landing/mobile-menu.tsx`
- `apps/marketing/components/landing/landing-hero.tsx`
- `apps/marketing/components/landing/follow-up-flow.tsx`
- `apps/marketing/components/landing/use-moments.tsx`
- `apps/marketing/components/landing/report-transformation-story.tsx`
- `apps/marketing/components/landing/pricing-decision.tsx`

Tests:

- `apps/marketing/__tests__/landing-foundation.test.tsx`
- `apps/marketing/__tests__/landing-hero.test.tsx`
- `apps/marketing/__tests__/follow-up-flow.test.tsx`
- `apps/marketing/__tests__/use-moments.test.tsx`
- `apps/marketing/__tests__/home-landing.test.tsx`
- `apps/marketing/__tests__/opengraph-image.test.ts`
- `apps/marketing/__tests__/report-transformation-story.test.tsx`
- `apps/marketing/__tests__/pricing-decision.test.tsx`
- `apps/marketing/__tests__/mobile-menu.test.ts`

## Exact verification

- Focused changed tests listed above: exit 0 — 29 pass, 0 fail, 259
  expectations across 9 files.
- `bun test apps/marketing/__tests__`: exit 0 — 85 pass, 0 fail, 777
  expectations across 16 files.
- `bun --filter @biume/marketing lint`: exit 0.
- `bun --filter @biume/marketing build`: exit 0 — Next.js compiled, TypeScript
  completed, 37 static pages generated, and `/` was generated successfully.
- `git diff --check`: exit 0.
- `rg -ni "témoignage|clients? satisfaits?|\\+[0-9]+%|hébergé en France|conforme au RGPD|envoi automatique" apps/marketing/app/page.tsx apps/marketing/components/landing`:
  exit 1 with no matches, which is the expected clean result.
- Built HTML check:
  `apps/marketing/.next/server/app/index.html` contains one Hanken font preload;
  `apps/marketing/.next/server/app/about.html` contains no font preload.

The build emitted only the existing multiple-lockfile workspace-root warning;
it selected the parent workspace root and completed successfully.

## Self-review and concerns

- Scope review found no unrelated source changes and the worktree was clean at
  the starting SHA.
- SSR contracts prove skip-link source order, destination, target focusability,
  exactly three visible follow-up steps, green-only final confirmation, and
  preservation of mobile labels, links, sign-in URL, and target sizing.
- Source contracts prove Hanken is absent from the root layout and that
  `LandingHeader` remains server-rendered; the production artifacts confirm the
  route-specific preload behavior.
- The mobile dismissal function has a direct behavior test for link and
  non-link activation. A live browser pass is still needed to verify keyboard
  focus transfer through the skip link and mobile `<details>` dismissal after
  real pointer and keyboard link activation at narrow viewports.
- No push was performed.
