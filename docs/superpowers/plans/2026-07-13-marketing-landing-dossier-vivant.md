# Dossier vivant Landing Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace the three weak homepage compositions with the approved Dossier vivant hero and compact report transformation, then remove the redundant standalone product proof.

**Architecture:** Keep the hero server-rendered and animate it with CSS only. Keep ReportTransformationStory as the single client island, but replace its four-state sticky observer with a one-shot intersection reveal over three focused units: note, bridge, and owner document. Preserve REPORT_TRANSFORMATION_DEMO as the factual content source and add one shared short-note export for the compact visuals.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Bun tests, CSS transforms/opacity, native IntersectionObserver.

---

**Design spec:** docs/superpowers/specs/2026-07-13-marketing-landing-dossier-vivant-design.md

## File map

- Modify apps/marketing/components/landing/report-transformation-demo.ts — shared compact note.
- Modify apps/marketing/components/landing/landing-hero.tsx — approved copy and integrated note/photo/report visual.
- Modify apps/marketing/components/landing/report-transformation-story.tsx — compact note/bridge/document transformation.
- Modify apps/marketing/app/globals.css — exact logo tokens, choreography, mobile fallback, and removal of sticky-story CSS.
- Modify apps/marketing/app/page.tsx — stop rendering ProductProof.
- Modify apps/marketing/__tests__/landing-content.test.ts — factual compact note.
- Modify apps/marketing/__tests__/landing-hero.test.tsx — hero content, structure, colors, and motion.
- Modify apps/marketing/__tests__/report-transformation-story.test.tsx — compact transformation and one-shot enhancement.
- Modify apps/marketing/__tests__/home-landing.test.tsx — four-section page assembly and live anchors.
- Keep apps/marketing/components/landing/product-proof.tsx and its dedicated test unchanged.

### Task 1: Build the Dossier vivant hero with tests first

**Files:**
- Modify: apps/marketing/components/landing/report-transformation-demo.ts
- Modify: apps/marketing/components/landing/landing-hero.tsx
- Modify: apps/marketing/app/globals.css
- Test: apps/marketing/__tests__/landing-content.test.ts
- Test: apps/marketing/__tests__/landing-hero.test.tsx

- [ ] **Step 1: Add a failing content test for the compact source note**

Import REPORT_NOTE_SUMMARY beside REPORT_TRANSFORMATION_DEMO and add:

    expect(REPORT_NOTE_SUMMARY).toBe(
      "Mobilité réduite à gauche · thorax. Amélioration pendant la séance.",
    );

- [ ] **Step 2: Replace the hero test contract**

Import REPORT_NOTE_SUMMARY in landing-hero.test.tsx. Replace the old copy and single-card assertions with:

    expect(html).toContain("Le lien après la séance");
    expect(text).toContain(
      "Vos observations restent précises. Le propriétaire, lui, comprend.",
    );
    expect(html).toContain(
      "Biume part de vos mots, structure un compte rendu clair, puis vous aide à garder le fil après la séance. Vous relisez et décidez de chaque envoi.",
    );
    expect(html).toContain("Voir le parcours");
    expect(html).toContain("15 jours d&#x27;essai");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Rien ne part sans vous");
    expect(text).toContain(REPORT_NOTE_SUMMARY);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("data-hero-note");
    expect(html).toContain("data-hero-report");
    expect(html).toContain("data-hero-brand-rail");
    expect(html).toContain("data-hero-journey");
    expect(html).toContain("SÉANCE");
    expect(html).toContain("PDF");
    expect(html).toContain("SUIVI");
    expect(html).not.toContain("Notes → compte rendu → suivi");
    expect(html).not.toMatch(/data-hero-photo[^>]*class="[^"]*hidden/);
    expect(html.match(/data-hero-report=/g)).toHaveLength(1);
    expect(signupAnchors).toHaveLength(1);
    expect(html).not.toMatch(exactZeroOpacity);

Extend the existing animation test:

    expect(css).toContain("--carnet-logo-violet: #8e82e8");
    expect(css).toContain("--carnet-logo-blue: #62a8c8");
    expect(css).toContain("--carnet-logo-green: #28c978");
    expect(css).toMatch(/\.landing-hero-note\s*{[^}]*animation:/s);
    expect(css).toMatch(/\.landing-hero-report\s*{[^}]*animation:/s);
    expect(css).toMatch(/@keyframes landing-hero-note-enter[\s\S]*transform:/);
    expect(css).toMatch(/@keyframes landing-hero-report-enter[\s\S]*transform:/);
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-hero-note/,
    );

- [ ] **Step 3: Run the focused tests and verify they fail**

    bun test apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/landing-hero.test.tsx

Expected: FAIL because REPORT_NOTE_SUMMARY, the new copy, and the hero data attributes do not exist.

- [ ] **Step 4: Export the shared short note**

Add before REPORT_TRANSFORMATION_DEMO:

    export const REPORT_NOTE_SUMMARY =
      "Mobilité réduite à gauche · thorax. Amélioration pendant la séance.";

- [ ] **Step 5: Replace the hero copy**

Import the new value:

    import {
      REPORT_NOTE_SUMMARY,
      type ReportTransformationDemo,
    } from "./report-transformation-demo";

Use:

    const reassurance = [
      "15 jours d'essai",
      "Sans carte bancaire",
      "Rien ne part sans vous",
    ] as const;

Replace the approved text fragments:

    <p data-hero-entry style={entryStyle(0)} className="landing-hero-entry font-mono text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--carnet-logo-violet)]">
      Le lien après la séance
    </p>
    <h1 data-hero-entry style={entryStyle(80)} className="carnet-hero-sans landing-hero-entry mt-5 text-[clamp(3rem,5.8vw,5.75rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[color:var(--carnet-ink)]">
      Vos observations restent précises.
      <span className="carnet-hero-serif block font-normal italic">
        Le propriétaire, lui, comprend.
      </span>
    </h1>
    <p data-hero-entry style={entryStyle(160)} className="landing-hero-entry mt-6 max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8">
      Biume part de vos mots, structure un compte rendu clair, puis vous aide à
      garder le fil après la séance. Vous relisez et décidez de chaque envoi.
    </p>
    <Link href="#produit" className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-6 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]">
      Voir le parcours
    </Link>

- [ ] **Step 6: Replace the right-side hero visual**

Use this component structure and the exact root classes:

    <div className="relative mx-auto min-h-[34rem] w-full max-w-[48rem] md:min-h-[38rem] lg:justify-self-end">
      <div
        data-hero-photo
        className="landing-hero-photo absolute inset-x-6 bottom-16 top-0 overflow-hidden rounded-[42%_0.75rem_2.75rem_0.75rem] bg-[color:var(--carnet-muted-surface)] sm:left-14 sm:right-8"
      >
        <Image
          src="/assets/images/landing/hero-practitioner-horse.png"
          alt="Une ostéopathe animalière observe un cheval pendant une séance"
          fill
          loading="lazy"
          quality={55}
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
      </div>

      <div
        data-hero-brand-rail
        aria-hidden="true"
        className="absolute bottom-32 right-0 top-8 hidden w-2 rounded-full bg-[linear-gradient(to_bottom,var(--carnet-logo-violet),var(--carnet-logo-blue),var(--carnet-logo-green))] sm:block"
      />

      <aside
        data-hero-note
        className="landing-hero-note absolute left-0 top-8 w-[min(16rem,64%)] rounded-[0.75rem_0.75rem_2rem_0.75rem] border border-white/12 bg-[color:var(--carnet-anthracite)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5"
      >
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-logo-violet)]">
          Votre note de séance
        </p>
        <p className="mt-3 border-l-2 border-[color:var(--carnet-logo-violet)] pl-3 text-xs leading-5 text-white/78 sm:text-sm sm:leading-6">
          {REPORT_NOTE_SUMMARY}
        </p>
      </aside>

      <article
        data-hero-report
        aria-label="Exemple de proposition adaptée dans Biume"
        className="landing-hero-report absolute bottom-0 right-0 w-[88%] overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-52px_rgba(29,29,33,0.45)] sm:w-[74%]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--carnet-line)] px-5 py-4">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
            Compte rendu propriétaire
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--carnet-green-soft)] px-3 py-1.5 font-mono text-[0.62rem] font-semibold">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[color:var(--carnet-logo-green)]" />
            Prêt à relire
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-6 sm:text-base sm:leading-7">
            {adaptedProposal}
          </p>
          <p className="mt-4 border-t border-[color:var(--carnet-line)] pt-4 text-xs text-[color:var(--carnet-muted)]">
            Vous pouvez encore modifier ce texte
          </p>
        </div>
      </article>

      <div
        data-hero-journey
        aria-label="Parcours : séance, PDF, suivi"
        className="absolute bottom-3 left-2 hidden w-48 rounded-[0.7rem_1.5rem_0.7rem_0.7rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-canvas)] px-3 py-3 sm:block"
      >
        <div className="grid grid-cols-3 border-t border-[color:var(--carnet-line)] pt-2 font-mono text-[0.55rem] font-semibold">
          <span className="text-[color:var(--carnet-logo-violet)]">SÉANCE</span>
          <span className="text-center text-[color:var(--carnet-logo-blue)]">PDF</span>
          <span className="text-right text-[color:var(--carnet-logo-green)]">SUIVI</span>
        </div>
      </div>
    </div>

- [ ] **Step 7: Add exact logo tokens and hero choreography**

Add to .carnet-theme:

    --carnet-logo-violet: #8e82e8;
    --carnet-logo-blue: #62a8c8;
    --carnet-logo-green: #28c978;

Inside the existing desktop media query:

    .landing-hero-note {
      animation: landing-hero-note-enter 620ms cubic-bezier(0.16, 1, 0.3, 1)
        260ms both;
    }

    .landing-hero-report {
      animation: landing-hero-report-enter 720ms cubic-bezier(0.16, 1, 0.3, 1)
        360ms both;
    }

Add:

    @keyframes landing-hero-note-enter {
      from { transform: translate3d(-14px, 12px, 0) rotate(-1deg); }
      to { transform: translate3d(0, 0, 0) rotate(0); }
    }

    @keyframes landing-hero-report-enter {
      from { transform: translate3d(18px, 16px, 0) scale(0.985); }
      to { transform: translate3d(0, 0, 0) scale(1); }
    }

Add landing-hero-note and landing-hero-report to the reduced-motion animation reset.

- [ ] **Step 8: Run focused tests and commit**

    bun test apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/landing-hero.test.tsx

Expected: PASS.

    git add apps/marketing/components/landing/report-transformation-demo.ts apps/marketing/components/landing/landing-hero.tsx apps/marketing/app/globals.css apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/landing-hero.test.tsx
    git commit -m "feat(marketing): redesign landing hero as living report"

### Task 2: Replace the sticky story with the compact transformation

**Files:**
- Modify: apps/marketing/components/landing/report-transformation-story.tsx
- Modify: apps/marketing/app/globals.css
- Test: apps/marketing/__tests__/report-transformation-story.test.tsx

- [ ] **Step 1: Write the failing compact-story test**

Import REPORT_NOTE_SUMMARY. Replace the first test body with:

    expect(text).toContain("De vos notes au propriétaire");
    expect(text).toContain("Le même fond. Une forme enfin lisible.");
    expect(text).toContain("Vous notez librement. Biume organise. Vous relisez.");
    expect(text).toContain(REPORT_NOTE_SUMMARY);
    expect(text).toContain(demo.adaptedProposal);
    expect(html).toContain("data-report-note");
    expect(html).toContain("data-report-bridge");
    expect(html).toContain("data-report-document");
    expect(html.match(/data-report-token=/g)).toHaveLength(3);
    expect(text).toContain("Thorax");
    expect(text).toContain("Gauche");
    expect(text).toContain("Évolution");
    expect(text).toContain("Vous notez");
    expect(text).toContain("Biume organise");
    expect(text).toContain("Vous décidez");
    expect(text).toContain("Prêt à relire");
    expect(html).toContain('id="comment-ca-marche"');
    expect(html).not.toContain("data-report-state");
    expect(html).not.toContain("data-report-layer");
    expect(html).not.toContain("md:min-h-[160svh]");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");

Replace the enhancement assertions with:

    expect(source).toContain("useEffect");
    expect(source).toContain("IntersectionObserver");
    expect(source).toContain('section.dataset.reportMotion = "ready"');
    expect(source).toContain('section.dataset.reportEnhanced = "true"');
    expect(source).toContain("observer.disconnect()");
    expect(source).toContain("matchMedia");
    expect(source).not.toContain("new Map<HTMLElement, number>()");
    expect(source).not.toContain("reportActive");
    expect(source).not.toContain('from "motion/react"');
    expect(source).not.toContain("useState(");
    expect(css).toContain('[data-report-motion="ready"]');
    expect(css).toContain('[data-report-enhanced="true"]');
    expect(css).toMatch(/\[data-report-motion="ready"\][\s\S]*scaleX\(0\)/);
    expect(css).toMatch(/\[data-report-enhanced="true"\][\s\S]*scaleX\(1\)/);
    expect(source).not.toMatch(/data-report-note[^>]*min-h/);
    expect(source).not.toMatch(/data-report-document[^>]*min-h/);

- [ ] **Step 2: Run the story test and verify it fails**

    bun test apps/marketing/__tests__/report-transformation-story.test.tsx

Expected: FAIL because the current component still renders four sticky states.

- [ ] **Step 3: Replace the observer with a one-shot enhancement**

Use this hook:

    function useReportEnhancement(sectionRef: RefObject<HTMLElement | null>) {
      useEffect(() => {
        const section = sectionRef.current;
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (!section || reduceMotion || !("IntersectionObserver" in window)) {
          return;
        }

        section.dataset.reportMotion = "ready";
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              return;
            }
            section.dataset.reportEnhanced = "true";
            observer.disconnect();
          },
          { threshold: 0.24 },
        );

        observer.observe(section);
        return () => {
          observer.disconnect();
          delete section.dataset.reportMotion;
          delete section.dataset.reportEnhanced;
        };
      }, [sectionRef]);
    }

Use this React import so the ref and token delay stay type-safe:

    import {
      useEffect,
      useRef,
      type CSSProperties,
      type RefObject,
    } from "react";

- [ ] **Step 4: Replace the five old rendering helpers with three focused units**

Delete StepStateContent, TransformationStep, DocumentBody, ReportDocumentLayer, and ReportDocumentSequence. Add:

    const reportTokens = ["Thorax", "Gauche", "Évolution"] as const;

    function SourceNote() {
      return (
        <article
          data-report-note
          className="report-note-card self-center rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-white/14 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
        >
          <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            <span className="text-[color:var(--carnet-logo-violet)]">
              Votre note de séance
            </span>
            <span className="text-white/45">01</span>
          </div>
          <p className="mt-6 border-l-2 border-[color:var(--carnet-logo-violet)] pl-4 text-base leading-7 text-white/82">
            {REPORT_NOTE_SUMMARY}
          </p>
          <p className="mt-7 inline-flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/45">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[color:var(--carnet-logo-violet)]" />
            Vos mots restent la source
          </p>
        </article>
      );
    }

    function TransformationBridge() {
      return (
        <div
          data-report-bridge
          className="report-bridge relative flex min-h-40 items-center justify-center md:min-h-0"
        >
          <div
            aria-hidden="true"
            className="report-bridge-line absolute bottom-0 left-1/2 top-0 w-px origin-top bg-[linear-gradient(to_bottom,var(--carnet-logo-violet),var(--carnet-logo-blue),var(--carnet-logo-green))] md:bottom-auto md:left-0 md:right-0 md:top-1/2 md:h-px md:w-auto md:origin-left md:bg-[linear-gradient(to_right,var(--carnet-logo-violet),var(--carnet-logo-blue),var(--carnet-logo-green))]"
          />
          <div className="relative rounded-full border border-white/15 bg-[color:var(--carnet-anthracite)] px-5 py-4 text-center shadow-[0_0_0_12px_var(--carnet-anthracite)]">
            <span aria-hidden="true" className="mx-auto block size-8 rotate-6 rounded-xl bg-[linear-gradient(135deg,var(--carnet-logo-violet),var(--carnet-logo-blue),var(--carnet-logo-green))]" />
            <strong className="mt-3 block text-xs">Biume organise</strong>
          </div>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-1.5 md:-bottom-8">
            {reportTokens.map((token, index) => (
              <span
                key={token}
                data-report-token
                style={{ "--token-index": index } as CSSProperties}
                className="report-token rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[0.58rem] font-semibold uppercase text-white/62"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      );
    }

    function OwnerDocument({ adaptedProposal }: { adaptedProposal: string }) {
      return (
        <article
          data-report-document
          className="report-owner-document self-center rounded-[0.8rem_0.8rem_2.5rem_0.8rem] border border-black/10 bg-[color:var(--carnet-surface)] p-6 text-[color:var(--carnet-ink)] shadow-[0_38px_80px_-48px_rgba(0,0,0,0.72)]"
        >
          <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            <span className="text-[#23774c]">Proposition propriétaire</span>
            <span className="text-[color:var(--carnet-muted)]">02</span>
          </div>
          <p className="mt-6 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
            Ce que le propriétaire peut lire
          </p>
          <p className="mt-3 text-lg leading-8 tracking-[-0.02em]">
            {adaptedProposal}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[color:var(--carnet-line)] pt-4 text-xs">
            <span className="text-[color:var(--carnet-muted)]">
              Texte encore modifiable
            </span>
            <span className="inline-flex items-center gap-2 font-mono font-semibold text-[#246342]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--carnet-logo-green)]" />
              Prêt à relire
            </span>
          </div>
        </article>
      );
    }

- [ ] **Step 5: Render the compact section and preserve both navigation anchors**

Render:

    <section
      ref={sectionRef}
      id="produit"
      data-landing-section="transformation"
      className="report-story-section scroll-mt-18 bg-[color:var(--carnet-anthracite)] px-4 py-10 text-white sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.72fr] lg:items-end lg:gap-20">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-green)]">
              De vos notes au propriétaire
            </p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl">
              Le même fond.
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                Une forme enfin lisible.
              </span>
            </h2>
          </div>
          <p className="max-w-[32ch] text-lg leading-7 text-white/62">
            Vous notez librement.
            <strong className="font-semibold text-white">Biume organise.</strong>
            Vous relisez.
          </p>
        </div>

        <div
          id="comment-ca-marche"
          className="mt-10 scroll-mt-24 grid gap-0 md:mt-12 md:grid-cols-[0.78fr_0.46fr_1.18fr] md:items-center"
        >
          <SourceNote />
          <TransformationBridge />
          <OwnerDocument adaptedProposal={demo.adaptedProposal} />
        </div>

        <ol className="mt-8 grid border-t border-white/15 sm:grid-cols-3">
          {["Vous notez", "Biume organise", "Vous décidez"].map(
            (label, index) => (
              <li key={label} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-white/15 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
                <span className="font-mono text-xs text-[color:var(--carnet-logo-violet)]">
                  0{index + 1}
                </span>
                <strong className="text-sm">{label}</strong>
              </li>
            ),
          )}
        </ol>
      </div>
    </section>

Keep normal spaces around inline strong/span content in the final JSX so the rendered sentence does not concatenate words.

- [ ] **Step 6: Replace obsolete sticky CSS with the one-shot reveal**

Delete report-document-layers, report-document-layer, data-report-progress, data-report-active, and the old report-specific reduced-motion rules. Add:

    @media (min-width: 768px) {
      [data-report-motion="ready"] [data-report-note],
      [data-report-motion="ready"] [data-report-document],
      [data-report-motion="ready"] .report-token {
        opacity: 0;
      }

      [data-report-motion="ready"] [data-report-note] {
        transform: translate3d(0, 18px, 0);
      }

      [data-report-motion="ready"] [data-report-document] {
        transform: translate3d(18px, 12px, 0);
      }

      [data-report-motion="ready"] .report-bridge-line {
        transform: scaleX(0);
      }

      [data-report-enhanced="true"] [data-report-note],
      [data-report-enhanced="true"] [data-report-document],
      [data-report-enhanced="true"] .report-token {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        transition:
          opacity 480ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      [data-report-enhanced="true"] [data-report-document] {
        transition-delay: 300ms;
      }

      [data-report-enhanced="true"] .report-bridge-line {
        transform: scaleX(1);
        transition: transform 720ms cubic-bezier(0.16, 1, 0.3, 1) 140ms;
      }

      [data-report-enhanced="true"] .report-token {
        transition-delay: calc(220ms + var(--token-index) * 80ms);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-report-note],
      [data-report-document],
      .report-token,
      .report-bridge-line {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }

On mobile, keep the connector in normal flow with min-h-40 and the vertical gradient classes shown in Step 4. Do not rotate or animate layout properties.

- [ ] **Step 7: Run the focused test and commit**

    bun test apps/marketing/__tests__/report-transformation-story.test.tsx

Expected: PASS.

    git add apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css apps/marketing/__tests__/report-transformation-story.test.tsx
    git commit -m "feat(marketing): compact report transformation story"

### Task 3: Remove the redundant homepage proof

**Files:**
- Modify: apps/marketing/app/page.tsx
- Modify: apps/marketing/__tests__/home-landing.test.tsx
- Verify unchanged: apps/marketing/components/landing/landing-header.tsx
- Verify unchanged: apps/marketing/components/landing/product-proof.tsx
- Test: apps/marketing/__tests__/product-proof.test.tsx

- [ ] **Step 1: Write the failing page-assembly assertions**

Use four ordered markers:

    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="transformation"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ];

    expect(html.match(/data-landing-section=/g)).toHaveLength(4);
    expect(html).not.toContain('data-landing-section="product-proof"');

Remove product-proof from the mobile budget loop. Replace the old story/proof assertions with:

    expect(text).toContain(
      "Vos observations restent précises. Le propriétaire, lui, comprend.",
    );
    expect(text).toContain("Le même fond. Une forme enfin lisible.");
    expect(text).toContain(REPORT_NOTE_SUMMARY);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain('id="produit"');
    expect(html).toContain('id="comment-ca-marche"');
    expect(html).not.toContain("PDF professionnel");
    expect(html).not.toContain("Relance de rendez-vous");
    expect(html).not.toContain("Pas une promesse abstraite");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");

Import REPORT_NOTE_SUMMARY. Add this source assertion:

    const homeSource = await Bun.file(
      new URL("../app/page.tsx", import.meta.url),
    ).text();
    expect(homeSource).not.toContain("ProductProof");

- [ ] **Step 2: Run the homepage test and verify it fails**

    bun test apps/marketing/__tests__/home-landing.test.tsx

Expected: FAIL because ProductProof still renders and the page still has five sections.

- [ ] **Step 3: Remove only the homepage ProductProof assembly**

Delete the ProductProof import and the ProductProof JSX call from apps/marketing/app/page.tsx. Do not delete product-proof.tsx.

- [ ] **Step 4: Run page, hero, story, and standalone proof tests**

    bun test apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/product-proof.test.tsx

Expected: PASS. The header links to #produit and #comment-ca-marche, and both IDs exist.

- [ ] **Step 5: Commit the page change**

    git add apps/marketing/app/page.tsx apps/marketing/__tests__/home-landing.test.tsx
    git commit -m "refactor(marketing): remove redundant homepage product proof"

### Task 4: Run quality gates and visual verification

**Files:**
- Verify all files modified in Tasks 1–3.

- [ ] **Step 1: Run all marketing tests**

    bun test apps/marketing/__tests__

Expected: all tests PASS.

- [ ] **Step 2: Run lint**

    bun --filter @biume/marketing lint

Expected: exit code 0.

- [ ] **Step 3: Build marketing**

    bun --filter @biume/marketing build

Expected: production build succeeds and generates the homepage.

- [ ] **Step 4: Check scope and formatting**

    git diff --check HEAD~3..HEAD
    git status --short

Expected: no diff-check output and no uncommitted implementation files. Untracked .superpowers/brainstorm directories are not committed.

- [ ] **Step 5: Start marketing for visual verification**

    bun --filter @biume/marketing dev

Expected: Next.js serves the marketing app on its configured local port.

- [ ] **Step 6: Verify desktop at 1440 × 1000**

- Hero note, photo, report, rail, and Séance/PDF/Suivi read as one composition.
- No text collides with rounded corners.
- Exact logo violet and green are visible without becoming large gradients.
- The transformation fits in one viewport and is not sticky.
- Neither card has a large empty area under its final line.
- ProductProof does not appear between transformation and pricing.
- Animations play once and do not loop.

- [ ] **Step 7: Verify mobile at 390 × 844**

- No horizontal overflow.
- The hero photograph remains visible.
- Note and report do not cover the practitioner's face or hands.
- The mini journey is hidden or placed without collision.
- Transformation order is note → connector → document.
- Cards use natural height.
- Pricing, FAQ, and final CTA remain unchanged.

- [ ] **Step 8: Verify reduced motion**

Enable reduced motion and reload.

Expected: all content is visible immediately in its final position and meaning does not depend on animation.

- [ ] **Step 9: Commit visual corrections only if verification required them**

    git add apps/marketing/components/landing/landing-hero.tsx apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/home-landing.test.tsx
    git commit -m "fix(marketing): polish dossier vivant responsive layout"

Then rerun:

    bun test apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/home-landing.test.tsx
    bun --filter @biume/marketing lint

Expected: all commands PASS.
