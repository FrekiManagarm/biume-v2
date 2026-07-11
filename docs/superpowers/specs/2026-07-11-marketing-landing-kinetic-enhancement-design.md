# Biume Marketing Landing Kinetic Enhancement

Date: 2026-07-11

Status: approved design direction, pending implementation plan

## Objective

Evolve the approved Biume homepage from a clean editorial landing into a more modern, premium and kinetic experience without weakening its human and animal character, conversion clarity, accessibility, SEO or performance.

The target is not an AI-themed SaaS page. The page should feel deliberately art-directed, contemporary and satisfying to use, with motion that supports hierarchy, storytelling, feedback and state changes.

## Relationship to the First Redesign

This document extends the approved redesign in `2026-07-11-marketing-landing-redesign-design.md`.

The following remain binding:

- the Biume logo and violet, blue and green identity;
- the human and animal documentary photography;
- the exact primary CTA label `Essayer gratuitement`;
- existing routes, canonical URLs, metadata, Service JSON-LD and conversion destinations;
- `webAppPath("/signup")`, `prefetch={false}` and the current Cal.com URL;
- prices of 29,99 € monthly and 24,99 € monthly with annual billing;
- no invented ratings, testimonials, customer logos, performance claims or urgency;
- no em dash or en dash characters in visible copy;
- system light and dark modes, reduced motion and full no-JavaScript usability.

This iteration explicitly supersedes the previous restriction against animation dependencies by allowing `motion/react` in the marketing app. It does not allow GSAP, parallax, scroll hijacking, perpetual decorative animation or a fake product dashboard.

## Current-State Audit

The first redesign solved credibility, copy, image quality, conversion hierarchy, theme support and accessibility. Its visual execution remains too restrained for the requested level of modernity.

Observed issues:

- the desktop hero leaves too much unused space and undersells the photography;
- typography is consistent but too uniform in scale and weight;
- multiple sections repeat the same heading, card and divider rhythm;
- the journey reads as four static cards instead of a progressing story;
- the result, pricing and CTA surfaces feel boxed and template-like;
- page-load reveals are subtle enough to be almost invisible;
- below-fold sections do not react meaningfully to scroll;
- the overall page is long without enough changes in pace or spatial composition.

Current dial reading:

- design variance: 5/10;
- motion intensity: 3/10;
- visual density: 3/10.

Target dial reading:

- design variance: 8/10;
- motion intensity: 7/10;
- visual density: 4/10.

## Approved Direction

The approved direction is **editorial kinetic**.

It combines:

- the compositional confidence of modern Framer and Billow landing pages;
- the restraint and precision of high-quality vertical SaaS sites;
- documentary imagery that keeps the experience grounded in real practitioners, owners and animals;
- kinetic typography and scroll storytelling used only where they clarify the narrative.

The memorable design move is the transition from a strong photographic hero into a sticky four-moment follow-up journey. The page should feel like the consultation continues naturally after the practitioner leaves the room.

## Visual System

### Color

- Keep `#6B5AC8` as the core action violet in light mode.
- Keep green exclusively for included, validated, sent and received states.
- Recalibrate neutrals toward a cooler pearl-grey family in light mode and a charcoal-violet family in dark mode.
- Use violet tonal surfaces sparingly to create depth, not generic purple glow.
- Do not use gradient headlines or neon outer glows.
- The logo keeps its existing violet, blue and green gradient.

### Typography

- Continue using Manrope on the homepage only.
- Increase contrast between display, body and functional values.
- Use tighter tracking and more deliberate weight changes rather than simply increasing every heading size.
- Keep the hero heading to two lines on desktop.
- Keep hero supporting copy under 20 words if copy is adjusted.
- Retain Geist Mono for prices, timing and functional states.

### Shape and Material

- Buttons remain full-pill.
- Content cards remain at 16 pixels.
- Controls remain at 10 pixels.
- Media may use 20 to 24 pixels when the image is a primary compositional element.
- Use thin inner borders, restrained tinted shadows and subtle surface layering.
- Avoid glassmorphism as a page-wide motif. The sticky header may use a restrained translucent material with a solid fallback.
- Do not overlay decorative labels or pills on photographs.

## Page Composition

### Header

The header remains one line and below 80 pixels high.

On scroll it may:

- reduce its vertical height slightly;
- increase background opacity and border definition;
- keep all navigation and conversion destinations unchanged.

The transformation must be subtle, reversible and static under reduced motion.

### Hero

Use an asymmetric 12-column composition.

- The copy occupies a stronger left block with more expressive scale.
- The horse photograph becomes larger and slightly offset, like an editorial cover.
- The image must remain fully visible on first paint and continue using `next/image`, `priority`, `fill`, explicit `sizes` and a reserved aspect-ratio wrapper.
- Remove the illustrative card currently overlaid on the photograph.
- Keep only category, heading, supporting copy and CTA group in the hero text stack.
- Place reassurance in a separate compact rail immediately below the hero.
- Primary and secondary CTAs remain visible in the initial desktop viewport.

### Reassurance Rail

The three existing facts remain unchanged.

- Present them as a compact horizontal rail on desktop and a vertical sequence on mobile.
- Use one structural line and progressive disclosure instead of three large empty columns.
- Do not add a logo wall, rating or testimonial.

### Problem Section

- Give the practitioner and dog photograph more visual weight.
- Use an offset editorial composition rather than another balanced split card.
- Allow the heading to overlap the media field only where contrast and reading order remain clear.
- Preserve the existing approved copy.

### Follow-Up Journey

The four moments remain `Observer`, `Valider`, `Suivre` and `Revoir`.

Desktop behavior:

- the section becomes a sticky scroll story;
- the main visual and heading remain anchored while each moment activates in sequence;
- a violet progress line communicates where the visitor is in the follow-up process;
- the active moment gains emphasis while completed moments remain legible;
- no horizontal scroll hijack or pinned full-page trap is permitted.

Mobile and no-JavaScript behavior:

- render the four moments as a normal vertical sequence;
- show every description in source order;
- do not require gesture discovery or JavaScript to access content.

### Product Outcome

- Replace the current flat document-and-list split with a more asymmetric composition.
- Keep `Résumé propriétaire`, `Retour à J+7` and `Timeline animal`.
- Present a real component preview derived from the existing content, not a decorative fake dashboard.
- Reveal the preview in reading order so the document appears to assemble naturally.
- Keep green limited to the received or validated state.

### Practitioner Control

`Biume prépare. Vous décidez.` becomes a stronger typographic interlude and a pacing break.

- Use scale, spacing and violet surface depth instead of another ordinary card.
- Keep the approved practitioner-control sentence unchanged.
- Do not introduce a new CTA.

### Pricing

- Preserve one offer, the two billing controls and both prices.
- Reduce the sense of a nested boxed SaaS pricing card.
- Give the price stronger functional typography and clearer surrounding whitespace.
- Animate the annual/monthly indicator with a short spring.
- Update price and billing detail as a single coherent state transition.
- Keep all content server-rendered and readable before hydration.

### FAQ

- Preserve five native `details` elements and all approved questions and answers.
- Add a smooth disclosure treatment where supported.
- Rotate the indicator and reveal content without breaking native keyboard behavior.
- Fall back to an instant native disclosure when animation support or JavaScript is unavailable.

### Final CTA

- Increase the photographic presence of the practitioner, owner and dog image.
- Use complementary entry rhythms for text and media.
- Preserve the exact signup and demonstration destinations.
- Keep both CTA labels on one line at every tested viewport.

### Footer

- Preserve every current link and compliance statement.
- Improve spacing and type rhythm only if required by the new page cadence.
- Do not turn the footer into an additional promotional section.

## Motion System

Use `motion/react` as the only animation library. Load it only inside small Client Component islands.

### Hero Sequence

- Keep the hero load sequence in native CSS so it also runs without JavaScript.
- Stagger category, heading, supporting copy and CTA group.
- Use transform and opacity for text.
- Keep the priority photograph visible immediately.
- Allow a small scale settling effect on the photograph without initial opacity, delayed visibility or LCP suppression.

### Header Morph

- Map a small scroll range to height, background opacity and border definition.
- Do not use React state for continuous scroll values.
- Use Motion values and transforms outside the render cycle.

### Reassurance Sequence

- Draw the structural line once as the rail enters the viewport.
- Reveal the three facts in reading order.
- The line communicates structure and the stagger communicates hierarchy.

### Section Reveals

- Use a reusable scroll-reveal island for key headings, media and grouped content.
- Reveal once when roughly 25 to 35 percent of the element enters the viewport.
- Use a 0.16, 1, 0.3, 1 easing for editorial entrances.
- Avoid applying the same reveal to every small element.

### Sticky Journey

- Use a dedicated client island.
- Determine active moment from element visibility or Motion scroll progress.
- Animate only transform, opacity and the progress-line scale.
- Avoid `window.addEventListener("scroll")`, React state driven on every frame and manual `requestAnimationFrame` loops.

### Pricing Feedback

- Use a short spring for the selected billing indicator.
- Animate price and billing detail as a state change, not a decorative loop.
- Preserve `aria-pressed`, keyboard focus and live announcement behavior.

### FAQ Feedback

- Keep `details` and `summary` as the semantic source of truth.
- Animate the indicator and disclosure only as progressive enhancement.

### Buttons

- Add a small upward hover response and short active compression.
- Move a directional affordance only when an arrow already exists or is added from one approved icon family.
- Do not add magnetic cursor behavior, particles, ripple effects or perpetual shimmer.

### Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- skip all initial transforms and opacity transitions;
- remove sticky progress animation and render all journey steps normally;
- disable header morphing and spring movement;
- preserve all content, hierarchy, focus and interaction states.

## Component Architecture

Keep static page sections as Server Components.

Add focused client islands with one responsibility each:

- `motion-reveal.tsx`: one-time viewport reveal for selected blocks, with a local `LazyMotion` boundary;
- `kinetic-header.tsx`: scroll-responsive header shell while navigation content remains declarative;
- `journey-story.tsx`: active journey state and progress line;
- pricing state remains inside `pricing.tsx` or a focused child if the file becomes too large.

Do not convert the entire homepage into a Client Component.

Prefer `LazyMotion` with the smallest feature bundle supported by the selected APIs. Verify the installed package before importing it. Add `motion` only to `apps/marketing` using Bun.

## Progressive Enhancement and Failure Modes

- Server-render the complete landing content.
- Never serialize hidden initial motion styles that leave content invisible without hydration.
- If Motion fails to load, content remains fully visible and navigable.
- If sticky positioning is unsupported, the journey remains a normal flow.
- If disclosure animation is unsupported, native FAQ behavior remains intact.
- Maintain stable image space during loading or image failure.
- Preserve clear focus outlines independently of hover motion.

## Conversion and SEO Guardrails

- Keep `Essayer gratuitement` as the only signup intent label.
- Keep `Voir le parcours` and `Voir la démonstration` as distinct secondary intents.
- Every primary CTA must continue to resolve to the signup URL.
- Preserve page copy unless a small cut is required to keep the hero supporting text within the approved length.
- Preserve metadata, canonical, OG dimensions and Service JSON-LD.
- Preserve all existing anchor IDs used by navigation and tests.
- Do not add fabricated proof, scarcity, savings or adoption claims.

## Responsive Behavior

Desktop:

- embrace asymmetry and sticky storytelling;
- keep the initial hero and CTAs within the viewport;
- avoid more than two consecutive split-image sections.

Tablet:

- reduce overlap and transform sticky journey into a simpler anchored sequence if vertical space is insufficient;
- keep navigation on one line or use the existing native mobile menu threshold.

Mobile:

- use a strict single column;
- render hero copy and CTA before the photograph;
- disable sticky behavior and large overlaps;
- keep CTA labels on one line;
- avoid horizontal document overflow;
- ensure every photograph keeps hands, faces and animals in a credible crop.

## Testing and Verification

Automated contracts must cover:

- exact CTA labels and destinations;
- hero copy and image path;
- absence of the removed hero overlay card;
- complete journey content in source order;
- five native FAQ disclosures;
- exact prices and billing states;
- absence of banned copy, em dash, en dash and old visual hooks;
- complete server-rendered content before hydration.

Run:

- focused Bun tests during implementation;
- the full marketing test suite;
- marketing lint;
- root type checking;
- the marketing production build;
- banned-pattern and motion-safety scans.

Browser verification must include:

- 1440 x 1000 light and dark;
- 834 x 1112 light;
- 390 x 844 light and dark;
- 390 x 844 reduced motion;
- 390 x 844 with JavaScript disabled;
- keyboard focus, mobile menu, pricing selector and FAQ;
- console errors, horizontal overflow and CTA wrapping;
- sticky journey activation and completion.

Lighthouse acceptance:

- performance at least 95;
- accessibility 100;
- SEO 100;
- LCP below 2.5 seconds;
- CLS below 0.1;
- no landing animation causing non-composited work or delayed LCP visibility.

## Out of Scope

- new routes or changes to information architecture;
- product application redesign;
- new testimonials, logos, ratings or analytics claims;
- new photography generation unless an existing crop proves unusable;
- GSAP, WebGL, Three.js, parallax or horizontal scroll hijacking;
- custom cursor, particles, gradient headline, neon glow or AI-themed visuals;
- autoplay video;
- animation on every card or text fragment.

## Acceptance Checklist

- The hero feels substantially more modern and visually confident than the first redesign.
- The page demonstrates motion intensity 7 with clearly visible but motivated choreography.
- Photography remains the dominant emotional asset.
- The hero image is visible immediately and remains a valid LCP candidate.
- The sticky journey makes the four follow-up moments easier to understand.
- No-JavaScript and reduced-motion versions expose all content.
- Violet remains the action color and green remains semantic.
- The page uses at least four distinct section layout families.
- No fake dashboard, decorative image label, gradient headline or invented proof is added.
- Routes, schema, prices, copy, CTA labels and destinations remain correct.
- All automated, responsive, accessibility and performance gates pass.
