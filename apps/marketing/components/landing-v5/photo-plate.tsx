import Image from "next/image";

import { Parallax, Reveal } from "./motion";

export function PhotoPlate({
  ariaLabel,
  eyebrow,
  quote,
  attribution,
  src,
  alt,
  objectPosition,
  parallaxFactor,
  tone,
  heightClass,
}: {
  ariaLabel: string;
  eyebrow: string;
  quote: string;
  attribution: string;
  src: string;
  alt: string;
  objectPosition: string;
  parallaxFactor: number;
  tone: "dark" | "light";
  heightClass: string;
}) {
  const overlay =
    tone === "dark"
      ? "linear-gradient(90deg, rgba(32,32,36,.78) 0%, rgba(32,32,36,.42) 46%, rgba(32,32,36,.08) 100%)"
      : "linear-gradient(90deg, rgba(247,247,244,.92) 0%, rgba(247,247,244,.6) 42%, rgba(247,247,244,.05) 100%)";
  const eyebrowClass =
    tone === "dark" ? "text-[#FDFDFB]/62" : "text-[color:var(--lv5-ink-soft)]";
  const quoteClass = tone === "dark" ? "text-[#FDFDFB]" : "text-[color:var(--lv5-ink)]";
  const attributionClass =
    tone === "dark" ? "text-[#FDFDFB]/72" : "text-[color:var(--lv5-ink-soft)]";

  return (
    <section aria-label={ariaLabel} className={`relative flex overflow-hidden ${heightClass}`}>
      <Parallax factor={parallaxFactor} className="absolute -top-[10%] -bottom-[10%] inset-x-0">
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition }}
          />
        </div>
      </Parallax>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: overlay }} />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col justify-center gap-3.5 px-[clamp(18px,4vw,34px)] py-[clamp(48px,8vh,96px)]">
        <Reveal>
          <p
            className={`font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.72rem] font-semibold tracking-[0.08em] uppercase ${eyebrowClass}`}
          >
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <p
            className={`max-w-[22ch] text-[clamp(1.9rem,3.6vw,3.2rem)] font-[650] leading-[1.04] tracking-[-0.03em] ${quoteClass}`}
          >
            {quote}
          </p>
        </Reveal>
        <Reveal delay={170}>
          <p className={`max-w-[34ch] text-[1rem] leading-[1.6] ${attributionClass}`}>
            {attribution}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
