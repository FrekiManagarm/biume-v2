import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@biume/ui/components/carousel"

// Inline styles carry slide sizing/color instead of arbitrary Tailwind
// utilities (h-40, bg-emerald-100, mx-12, ...): this repo's standalone CSS
// compile (.design-sync/scripts/compile-css.mjs) only scans
// packages/ui/src/** for class literals, so utilities that only appear in
// this preview file are silently dropped from the compiled stylesheet. See
// .design-sync/learnings/B7-complex.md for the full writeup.
const slides = [
  { label: "Consultation", bg: "#d1fae5", fg: "#065f46" },
  { label: "Vaccination", bg: "#dbeafe", fg: "#1e3a8a" },
  { label: "Grooming", bg: "#fef3c7", fg: "#78350f" },
  { label: "Surgery", bg: "#fee2e2", fg: "#7f1d1d" },
]

export function Default() {
  return (
    <Carousel
      className="w-full max-w-xs"
      style={{ marginLeft: 48, marginRight: 48 }}
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.label}>
            <div
              className="flex flex-col items-center justify-center gap-1 rounded-xl border"
              style={{ height: 160, backgroundColor: slide.bg, color: slide.fg }}
            >
              <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}>
                {index + 1}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {slide.label}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
