"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@biume/ui/lib/utils";

/**
 * Calcule le facteur d'échelle d'un contenu dessiné à largeur fixe pour
 * qu'il remplisse exactement la zone d'écran d'un cadre d'appareil, quelle
 * que soit la taille réelle du cadre à l'écran.
 *
 * `containerWidth` doit venir de `offsetWidth` (largeur de mise en page),
 * jamais de `getBoundingClientRect().width` : les cadres inclinés (arc
 * mobile, tâche 13) ont un rect visuel différent de leur largeur de mise
 * en page à cause du `transform: rotate(...)`, ce qui fausserait le calcul.
 */
export function computeFrameScale({
  containerWidth,
  screenWidthRatio,
  contentWidth,
}: {
  containerWidth: number;
  screenWidthRatio: number;
  contentWidth: number;
}): number {
  if (containerWidth <= 0 || contentWidth <= 0) return 0;
  return (containerWidth * screenWidthRatio) / contentWidth;
}

const PHONE_CONTENT_WIDTH = 216;
const PHONE_SCREEN = {
  left: 4.908,
  top: 2.183,
  width: 89.954,
  height: 95.635,
  radiusX: 14.32,
  radiusY: 6.61,
};

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
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
          screenWidthRatio: PHONE_SCREEN.width / 100,
          contentWidth: PHONE_CONTENT_WIDTH,
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
      className={cn("relative aspect-[433/882]", className)}
    >
      <div
        aria-hidden="true"
        className="absolute overflow-hidden bg-[color:var(--lv5-surface)]"
        style={{
          left: `${PHONE_SCREEN.left}%`,
          top: `${PHONE_SCREEN.top}%`,
          width: `${PHONE_SCREEN.width}%`,
          height: `${PHONE_SCREEN.height}%`,
          borderRadius: `${PHONE_SCREEN.radiusX}% / ${PHONE_SCREEN.radiusY}%`,
        }}
      >
        <div
          style={{
            width: `${PHONE_CONTENT_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <PhoneBezel maskId={maskId} />
    </div>
  );
}

function PhoneBezel({ maskId }: { maskId: string }) {
  return (
    <svg
      viewBox="0 0 433 882"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width="433" height="882" fill="white" />
          <rect
            x={(PHONE_SCREEN.left / 100) * 433}
            y={(PHONE_SCREEN.top / 100) * 882}
            width={(PHONE_SCREEN.width / 100) * 433}
            height={(PHONE_SCREEN.height / 100) * 882}
            rx={(PHONE_SCREEN.radiusX / 100) * 433}
            ry={(PHONE_SCREEN.radiusY / 100) * 882}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="433"
        height="882"
        rx="64"
        fill="#1D1D21"
        mask={`url(#${maskId})`}
      />
      <rect
        width="433"
        height="882"
        rx="64"
        fill="none"
        stroke="#DEDED7"
        strokeWidth="2"
      />
      {/* Dynamic island */}
      <rect x="152" y="28" width="130" height="34" rx="17" fill="#1D1D21" />
      {/* Boutons latéraux */}
      <rect x="-2" y="180" width="4" height="60" rx="2" fill="#DEDED7" />
      <rect x="-2" y="260" width="4" height="90" rx="2" fill="#DEDED7" />
      <rect x="431" y="220" width="4" height="110" rx="2" fill="#DEDED7" />
    </svg>
  );
}
