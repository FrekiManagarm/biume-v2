import { afterEach, describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { FollowUpContinuity } from "../components/landing/follow-up-continuity";
import { act, cleanup, render } from "./dom-test-utils";

const intersectionObservers: ControlledIntersectionObserver[] = [];

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly scrollMargin = "0px";
  readonly thresholds: readonly number[];
  private readonly callback: IntersectionObserverCallback;
  private readonly observedTargets = new Set<Element>();

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    intersectionObservers.push(this);
  }

  disconnect() {
    this.observedTargets.clear();
  }

  observe(target: Element) {
    this.observedTargets.add(target);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(target: Element) {
    this.observedTargets.delete(target);
  }

  isObserving(target: Element) {
    return this.observedTargets.has(target);
  }

  enterViewport() {
    const entries = Array.from(this.observedTargets, (target) => {
      const bounds = target.getBoundingClientRect();

      return {
        boundingClientRect: bounds,
        intersectionRatio: 1,
        intersectionRect: bounds,
        isIntersecting: true,
        rootBounds: null,
        target,
        time: 0,
      } satisfies IntersectionObserverEntry;
    });

    this.callback(entries, this);
  }
}

afterEach(() => {
  cleanup();
  intersectionObservers.length = 0;
  Reflect.deleteProperty(globalThis, "IntersectionObserver");
  Reflect.deleteProperty(window, "IntersectionObserver");
});

describe("follow-up continuity", () => {
  test("orders follow-up continuity and reserves green for confirmation", () => {
    const continuityHtml = renderToStaticMarkup(<FollowUpContinuity />);
    const steps = Array.from(
      continuityHtml.matchAll(
        /<li\b[^>]*data-follow-up-step="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g,
      ),
    );

    expect(steps.map((step) => step[1])).toEqual([
      "Compte rendu finalisé",
      "Suivi préparé",
      "Rappel confirmé",
    ]);
    expect(steps).toHaveLength(3);
    expect(steps[0]?.[2]).not.toContain("atelier-green-soft");
    expect(steps[0]?.[2]).not.toContain("atelier-green-ink");
    expect(steps[1]?.[2]).not.toContain("atelier-green-soft");
    expect(steps[1]?.[2]).not.toContain("atelier-green-ink");
    expect(steps[2]?.[2]).toContain("atelier-green-soft");
    expect(steps[2]?.[2]).toContain("atelier-green-ink");
  });

  test("reveals the ordered steps sequentially without hiding server content", async () => {
    const continuityHtml = renderToStaticMarkup(<FollowUpContinuity />);
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();

    expect(
      continuityHtml.match(/\batelier-sequence-step\b/g),
    ).toHaveLength(3);
    expect(css).toContain(".atelier-sequence-step:nth-child(2)");
    expect(css).toContain(".atelier-sequence-step:nth-child(3)");
    expect(css).toContain(
      '[data-sequence-active="true"] .atelier-sequence-step',
    );
    expect(continuityHtml).not.toMatch(/opacity(?:-|:)0(?:\D|$)/);
  });

  test("starts the actual sequence only when it enters the viewport", () => {
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: ControlledIntersectionObserver,
      writable: true,
    });
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: ControlledIntersectionObserver,
      writable: true,
    });

    const { container } = render(<FollowUpContinuity />);
    const sequence = container.querySelector<HTMLElement>(
      "[data-follow-up-sequence]",
    );

    expect(sequence).not.toBeNull();
    if (!sequence) {
      return;
    }

    expect(sequence.dataset.sequenceActive).toBe("false");
    expect(intersectionObservers).toHaveLength(1);
    expect(intersectionObservers[0]?.isObserving(sequence)).toBe(true);

    act(() => intersectionObservers[0]?.enterViewport());

    expect(sequence.dataset.sequenceActive).toBe("true");
  });
});
