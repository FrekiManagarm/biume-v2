"use client";

import { useEffect } from "react";

const SCENE_SELECTOR = "[data-landing-section]";
const SCENE_ATTRIBUTE = "data-cinematic-scene";

export function CinematicSceneController() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(SCENE_SELECTOR),
    );
    const ratios = new Map<Element, number>();

    const setScene = (section: HTMLElement) => {
      const scene = section.dataset.landingSection;
      if (scene) document.documentElement.setAttribute(SCENE_ATTRIBUTE, scene);
    };

    if (sections[0]) setScene(sections[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }

        const active = sections.reduce<HTMLElement | undefined>(
          (best, section) =>
            !best || (ratios.get(section) ?? 0) > (ratios.get(best) ?? 0)
              ? section
              : best,
          undefined,
        );
        if (active && (ratios.get(active) ?? 0) > 0) setScene(active);
      },
      { rootMargin: "-18% 0px -52%", threshold: [0, 0.15, 0.35, 0.6] },
    );

    for (const section of sections) observer.observe(section);
    return () => {
      observer.disconnect();
      document.documentElement.removeAttribute(SCENE_ATTRIBUTE);
    };
  }, []);

  return null;
}
