import { Badge } from "@biume/ui/components/badge"

export function Default() {
  return <Badge>New</Badge>
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  )
}

export function StatusBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Paid</Badge>
      <Badge variant="outline">Pending</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  )
}
