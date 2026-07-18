"use client";

import {
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";

export function FollowUpSequence({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element {
  const sequenceRef = useRef<HTMLOListElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const sequence = sequenceRef.current;

    if (!sequence || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.25 },
    );

    observer.observe(sequence);

    return () => observer.disconnect();
  }, []);

  return (
    <ol
      ref={sequenceRef}
      data-follow-up-sequence
      data-sequence-active={isActive}
      className={className}
    >
      {children}
    </ol>
  );
}
