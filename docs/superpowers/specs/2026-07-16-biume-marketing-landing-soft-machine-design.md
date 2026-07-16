# Biume Marketing Landing: La mécanique douce

Date: 2026-07-16

Status: approved design direction, pending implementation plan

## Objective

Rebuild the Biume marketing homepage from the ground up as a vivid, product-led landing page for French animal osteopaths. The experience takes inspiration from Clay's visual richness, varied narrative rhythm and product demonstrations without copying its illustrations, composition or brand language.

The page must make one transformation immediately understandable: Biume turns the practitioner's own session notes into a clear owner-facing report while preserving the practitioner's precision, judgment and control.

## Strategic Foundation

- Primary audience: independent animal osteopaths.
- Secondary reach: other animal wellness practitioners, acknowledged discreetly without weakening the primary positioning.
- Positioning: Biume is the specialized space for owner-facing reports and post-session follow-up.
- Memorable line: `De vos notes au propriétaire, sans perdre votre regard métier.`
- Primary conversion: `Essayer gratuitement`, leading to the existing 15-day free trial without a credit card.
- Secondary conversion: `Demander une démo`, leading to the existing free demonstration booking destination.
- Brand personality: vivid, ingenious and reassuring.
- Proof posture: no testimonials, usage figures, partner logos or customer claims may be invented. Product demonstrations are the proof.

## Creative Direction

### Creative North Star

The approved direction is **La mécanique douce**.

Biume should feel like a precise mechanism that can be understood by watching it work. Notes enter, information is organized, the practitioner reviews the result, and follow-up continues. The mechanism is colorful and memorable, but every movement remains calm, human and controlled.

This direction rejects:

- generic SaaS card grids;
- cold clinical or veterinary aesthetics;
- childish pet-brand visuals;
- excessive AI symbolism or claims;
- literal imitation of Clay;
- the previous editorial notebook treatment, including serif italics, repeated uppercase kickers and oversized asymmetric card corners.

### Color Roles

The existing Biume identity remains unchanged:

- `#6B5AC8`, violet de décision: primary actions, active choices, focus and practitioner control;
- `#5D9BB8`, bleu de liaison: movement between notes, report and follow-up;
- `#2E9866`, vert de validation: confirmed, sent or received states only;
- `#F7F7F4`, blanc atelier: primary light canvas;
- `#FDFDFB`, surface nette: product tools and document surfaces;
- `#202024`, anthracite profond: occasional high-contrast narrative sequences.

The page uses a committed palette. Color changes correspond to changes in meaning, not decoration. The planned section rhythm is neutral, blue, violet, anthracite, neutral, violet-soft, neutral. Green remains confined to confirmed outcomes inside those sections.

### Typography

Use **Hanken Grotesk** as the single primary family for display, body and interface labels. It was selected for its calm, professional and readable voice. Brand personality comes from composition, color and product choreography rather than from an eccentric typeface.

- Hero display: up to `6rem`, weight 650 to 700, line height about `0.92`, letter spacing no tighter than `-0.04em`.
- Section headlines: fluid `2.25rem` to `4.5rem`, weight 650 to 700.
- Body: `1rem` to `1.125rem`, line height near `1.65`, maximum line length around 70 characters.
- System monospace: only for functional values such as dates, prices and statuses. It is not used as repeated section decoration.

### Shape and Elevation

- Marketing actions remain full-pill with a minimum height of 48 pixels.
- Product controls use a 10-pixel radius.
- Product surfaces use a 16-pixel radius.
- Dominant media use a maximum radius of 24 pixels.
- Large 32-pixel or greater card radii are prohibited.
- Surfaces are flat by default. Short shadows appear only when an object is elevated or manipulated.
- A surface never combines a decorative border with a large soft shadow.

## Image System

The approved image strategy is **hybrid orchestrated**.

The top of the page is dominated by an original abstract raster illustration and a faithful product transformation. Documentary photography appears later to reconnect the software with the practitioner's real work and relationship with animals.

### Hero Illustration

Create one original raster illustration in the Biume violet, blue and green palette. It depicts an abstract soft mechanism that turns a loose note-shaped object into a structured document-shaped object and then a validated follow-up signal.

Requirements:

- tactile three-dimensional material with controlled softness;
- brand colors used semantically, with green only on the completed output;
- no text embedded in the image;
- no animals, people, medical symbols, robots or AI clichés;
- no recreation of Clay's tubes, balls, hills, funnels or signature contraptions;
- no sketchy SVG or hand-drawn fallback;
- wide composition suitable for responsive cropping and efficient local delivery.

### Documentary Photography

Reuse two existing local photographs:

- the horse practitioner image as the strongest human anchor in the middle of the page;
- the practitioner, owner and animal image near the final conversion section.

The dog-care image remains available if the final composition needs a smaller supporting moment, but the page should not become a photo gallery.

## Page Architecture

### 1. Compact Header and Demonstrative Hero

The header stays below 80 pixels and contains the Biume brand, factual navigation, sign-in and the primary trial CTA. Mobile navigation remains keyboard-accessible and must not be clipped by an overflow container.

The hero includes:

- the memorable line as the H1;
- a concise explanation of the specialized report and follow-up positioning;
- `Essayer gratuitement` as the primary CTA;
- `Demander une démo` as the secondary CTA;
- the original soft-machine illustration;
- a compact factual rail containing `15 jours d'essai`, `Sans carte bancaire` and `Rien ne part sans vous`.

The primary CTA stays visually dominant. Both conversion paths remain visible in the initial desktop viewport.

### 2. Notes-to-Report Transformation

This is the main product proof. It shows a faithful before-and-after transformation using realistic existing report content:

- practitioner notes;
- Biume's organized proposal;
- the owner-facing report ready for review.

The interaction may reveal or compare the layers, but all source content must exist in server-rendered markup before hydration. The visitor must understand the transformation without playing an animation.

### 3. Practitioner Control Interlude

Use a committed violet section with the statement `Biume prépare. Vous décidez.`

Show the available actions before validation, such as editing, reformulating and removing content, then the deliberate sharing action after validation. This section turns practitioner control into visible product proof rather than a footnote.

### 4. Post-Session Follow-Up Flow

Use an anthracite sequence to connect three states:

- report sent;
- owner follow-up at J+7;
- animal timeline enriched for the next consultation.

Blue communicates movement and green appears only on confirmed outcomes. The sequence can progress with scroll but must not trap scrolling, require horizontal gestures or hide content without JavaScript.

### 5. Concrete Use Moments

Present three factual situations where Biume helps:

- turn precise notes into an owner-readable report;
- prepare a clear follow-up after the session;
- preserve useful history for the next consultation.

These are varied compositions, not an identical icon-card grid. No result metric is displayed without validated data.

### 6. Simple Pricing Decision

Keep one offer and the existing monthly and annual billing choices. Preserve the approved prices:

- `29,99 €` billed monthly;
- `24,99 €` per month with annual billing.

The price area uses a neutral or violet-soft surface because the visitor is still choosing. Green remains reserved for confirmed product outcomes. The selector stays accessible, server-readable and announced coherently when its state changes.

### 7. FAQ and Final Conversion

Keep the native semantic FAQ with five `details` elements and factual answers. The final conversion section combines the practitioner, owner and animal photograph with:

- the primary free-trial action;
- the secondary free-demo action;
- concise reassurance about the trial and practitioner control.

All existing compliance and navigation links remain in the footer.

## Motion and Interaction

Motion is choreographed but concentrated in three moments:

1. The hero's abstract mechanism assembles briefly on page load without delaying the H1, CTAs or image visibility.
2. The notes-to-report section progressively shows the transformation as the visitor scrolls.
3. The post-session sequence connects the report, J+7 follow-up and timeline.

Buttons and controls use small tactile translations and active compression. There is no perpetual decorative animation, scroll hijacking, parallax or magnetic cursor behavior.

Every animated section has a visible static default. Under `prefers-reduced-motion: reduce`, the experience uses instant state changes or a short crossfade, and all content remains available.

## Technical Architecture

Keep the existing Next.js App Router marketing application.

- Page composition and content sections remain Server Components.
- Client Components are limited to the hero mechanism, notes-to-report enhancement, follow-up sequence and existing billing selector.
- Use the installed `motion/react` dependency for advanced orchestrated sequences.
- Use CSS for simple hover, focus, disclosure and reduced-motion behavior.
- Keep `next/image` for all raster assets with explicit dimensions or aspect-ratio containers, responsive `sizes` and local optimized delivery.
- Keep existing SEO metadata, canonical URL, Service JSON-LD, pricing values, `webAppPath` conversion destinations and demonstration URL.
- Do not add a new styling system, animation dependency or general-purpose state library.

Suggested component boundaries:

- `LandingHeader`: brand, navigation and conversion controls;
- `SoftMachineHero`: H1, conversion hierarchy, reassurance rail and hero illustration;
- `ReportTransformation`: faithful notes-to-report proof;
- `PractitionerControl`: violet decision interlude;
- `FollowUpFlow`: post-session progression;
- `UseMoments`: three concrete situations with varied compositions;
- `PricingDecision`: existing offer and billing state;
- `LandingFaq`: native disclosures;
- `FinalCta`: documentary close and both conversion paths.

## Accessibility, Performance and Resilience

- Target WCAG 2.2 AA.
- Body text must meet 4.5:1 contrast and large text must meet 3:1.
- Every interactive control has a visible keyboard focus state and a minimum target size of 44 pixels.
- Color never communicates state alone.
- Content order remains meaningful in the DOM and without CSS animation.
- The page remains fully understandable without JavaScript.
- The hero H1, CTAs and principal illustration are visible on first paint.
- Avoid layout shift by reserving media dimensions.
- Keep the generated illustration optimized and responsive.
- Preserve the existing inline critical CSS setting.

## Verification

Implementation verification must include:

- targeted Bun tests for homepage copy, conversion destinations, prices, semantic FAQ and SSR visibility;
- relevant existing marketing tests;
- the marketing application production build;
- keyboard navigation through header, hero actions, pricing selector, FAQ and final actions;
- contrast checks for every text/background pair, especially muted text and colored sections;
- rendered checks at 375, 768 and 1440 pixels;
- reduced-motion rendering and interaction checks;
- confirmation that no invented testimonial, logo, metric or unsupported claim appears.

## Scope Boundaries

The redesign covers the marketing homepage and homepage-specific components and styles. It does not redesign SEO landing pages, blog pages, the authenticated product application or shared product UI. Shared footer behavior, metadata and conversion helpers may be adjusted only where required to support the homepage without changing their meaning.
