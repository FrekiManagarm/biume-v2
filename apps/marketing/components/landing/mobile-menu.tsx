"use client";

import type { MouseEvent, ReactNode } from "react";

type LinkActivationEvent = Pick<
  MouseEvent<HTMLDetailsElement>,
  "currentTarget" | "target"
>;

function supportsClosest(
  target: EventTarget | null,
): target is EventTarget & Pick<Element, "closest"> {
  return (
    target !== null &&
    "closest" in target &&
    typeof target.closest === "function"
  );
}

export function dismissMobileMenuOnLinkActivation({
  currentTarget,
  target,
}: LinkActivationEvent) {
  if (supportsClosest(target) && target.closest("a")) {
    currentTarget.removeAttribute("open");
  }
}

export function MobileMenu({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <details
      className="group relative"
      onClick={dismissMobileMenuOnLinkActivation}
    >
      {children}
    </details>
  );
}
