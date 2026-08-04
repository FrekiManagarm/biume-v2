import { Bold } from "lucide-react"

import { Toggle } from "@biume/ui/components/toggle"

export function Off() {
  return (
    <Toggle aria-label="Toggle bold">
      <Bold />
      Bold
    </Toggle>
  )
}

export function On() {
  return (
    <Toggle aria-label="Toggle bold" defaultPressed>
      <Bold />
      Bold
    </Toggle>
  )
}

export function Outline() {
  return (
    <Toggle variant="outline" aria-label="Toggle bold" defaultPressed>
      <Bold />
      Bold
    </Toggle>
  )
}

export function Disabled() {
  return (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Toggle bold" disabled>
        <Bold />
      </Toggle>
      <Toggle aria-label="Toggle bold" disabled defaultPressed>
        <Bold />
      </Toggle>
    </div>
  )
}
