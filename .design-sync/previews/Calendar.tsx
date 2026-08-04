import { Calendar } from "@biume/ui/components/calendar"

// shadow-sm isn't picked up by this repo's standalone CSS compile (it never
// appears literally in packages/ui/src/**), so it's applied inline instead.
// See .design-sync/learnings/B7-complex.md.
const cardShadow = { boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }

export function Default() {
  return (
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 7, 14)}
      selected={new Date(2026, 7, 14)}
      className="rounded-lg border"
      style={cardShadow}
    />
  )
}

export function Range() {
  return (
    <Calendar
      mode="range"
      defaultMonth={new Date(2026, 7, 1)}
      selected={{ from: new Date(2026, 7, 10), to: new Date(2026, 7, 17) }}
      className="rounded-lg border"
      style={cardShadow}
    />
  )
}
