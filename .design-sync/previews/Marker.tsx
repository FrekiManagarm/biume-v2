import { Marker, MarkerIcon, MarkerContent } from "@biume/ui/components/marker"
import { CalendarCheckIcon } from "lucide-react"

export function Default() {
  return (
    <Marker>
      <MarkerIcon>
        <CalendarCheckIcon />
      </MarkerIcon>
      <MarkerContent>Appointment confirmed for March 12, 2026</MarkerContent>
    </Marker>
  )
}

export function Separator() {
  return (
    <Marker variant="separator">
      <MarkerContent>OR</MarkerContent>
    </Marker>
  )
}

export function Border() {
  return (
    <Marker variant="border">
      <MarkerContent>Vaccination history</MarkerContent>
    </Marker>
  )
}
