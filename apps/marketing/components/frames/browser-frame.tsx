"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@biume/ui/lib/utils";
import { computeFrameScale } from "./phone-frame";

const BROWSER_FRAME = { width: 1203, height: 753 };
const BROWSER_CONTENT_WIDTH = 1120;
const BROWSER_SCREEN = {
  left: 0.083,
  top: 6.906,
  width: 99.751,
  height: 92.961,
};

/** Voir `PHONE_CONTENT_HEIGHT` : sans hauteur, `h-full` ne remplit rien. */
const BROWSER_CONTENT_HEIGHT = Math.round(
  (BROWSER_CONTENT_WIDTH *
    (BROWSER_FRAME.height * BROWSER_SCREEN.height)) /
    (BROWSER_FRAME.width * BROWSER_SCREEN.width),
);

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
  const maskId = useId();

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
            height: `${BROWSER_CONTENT_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <BrowserBezel maskId={maskId} urlLabel={urlLabel} />
    </div>
  );
}

function BrowserBezel({
  maskId,
  urlLabel,
}: {
  maskId: string;
  urlLabel: string;
}) {
  return (
    <svg
      viewBox="0 0 1203 753"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/*
        Le châssis est rendu au-dessus du contenu : sans ce masque, son fond
        plein recouvrait entièrement la maquette et le cadre paraissait vide.
        Même principe que `PhoneBezel`, qui découpe déjà son écran.
      */}
      <defs>
        <mask id={maskId}>
          <rect width="1203" height="753" fill="white" />
          <rect
            x={(BROWSER_SCREEN.left / 100) * BROWSER_FRAME.width}
            y={(BROWSER_SCREEN.top / 100) * BROWSER_FRAME.height}
            width={(BROWSER_SCREEN.width / 100) * BROWSER_FRAME.width}
            height={(BROWSER_SCREEN.height / 100) * BROWSER_FRAME.height}
            rx="11"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="1203"
        height="753"
        rx="14"
        fill="#ECECE7"
        mask={`url(#${maskId})`}
      />
      <rect
        width="1203"
        height="753"
        rx="14"
        fill="none"
        stroke="#DEDED7"
        strokeWidth="1.5"
      />
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
