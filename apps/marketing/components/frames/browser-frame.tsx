"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@biume/ui/lib/utils";
import { computeFrameScale } from "./phone-frame";

const BROWSER_CONTENT_WIDTH = 1120;
const BROWSER_SCREEN = {
  left: 0.083,
  top: 6.906,
  width: 99.751,
  height: 92.961,
};

export function BrowserFrame({
  children,
  className,
  urlLabel = "app.biume.com",
}: {
  children: ReactNode;
  className?: string;
  urlLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      setScale(
        computeFrameScale({
          containerWidth: node.offsetWidth,
          screenWidthRatio: BROWSER_SCREEN.width / 100,
          contentWidth: BROWSER_CONTENT_WIDTH,
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-[1203/753]", className)}
    >
      <div
        aria-hidden="true"
        className="absolute overflow-hidden bg-[color:var(--lv5-surface)]"
        style={{
          left: `${BROWSER_SCREEN.left}%`,
          top: `${BROWSER_SCREEN.top}%`,
          width: `${BROWSER_SCREEN.width}%`,
          height: `${BROWSER_SCREEN.height}%`,
          borderRadius: "0 0 11px 11px",
        }}
      >
        <div
          style={{
            width: `${BROWSER_CONTENT_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <BrowserBezel urlLabel={urlLabel} />
    </div>
  );
}

function BrowserBezel({ urlLabel }: { urlLabel: string }) {
  return (
    <svg
      viewBox="0 0 1203 753"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="1203" height="753" rx="14" fill="#ECECE7" stroke="#DEDED7" strokeWidth="1.5" />
      <circle cx="30" cy="27" r="6" fill="#DEDED7" />
      <circle cx="52" cy="27" r="6" fill="#DEDED7" />
      <circle cx="74" cy="27" r="6" fill="#DEDED7" />
      <rect x="420" y="14" width="360" height="26" rx="13" fill="#ECECE7" stroke="#DEDED7" />
      <text x="600" y="31" textAnchor="middle" fontSize="12" fill="#8a8a92">
        {urlLabel}
      </text>
    </svg>
  );
}
