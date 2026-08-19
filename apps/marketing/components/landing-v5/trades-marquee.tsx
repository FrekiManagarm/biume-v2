import { TRADES } from "./content";

export function LandingV5TradesMarquee() {
  const doubled = [...TRADES.items, ...TRADES.items];

  return (
    <section aria-label={TRADES.lead} className="overflow-hidden py-[clamp(28px,4vw,44px)]">
      <p className="mb-4 text-center text-[0.85rem] text-[color:var(--lv5-ink-soft)]">
        {TRADES.lead}
      </p>
      <div
        aria-hidden="true"
        className="relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 14%, black 86%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 14%, black 86%, transparent)",
        }}
      >
        <div
          className="flex w-max gap-10 whitespace-nowrap"
          style={{ animation: "biume-marquee 36s linear infinite" }}
        >
          {doubled.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 text-[clamp(1.05rem,1.5vw,1.3rem)] font-semibold text-[#75757c]"
            >
              {item}
              <span aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
      {/* Contenu réel pour les technologies d'assistance : la version animée est aria-hidden. */}
      <p className="sr-only">{TRADES.items.join(", ")}</p>
    </section>
  );
}
