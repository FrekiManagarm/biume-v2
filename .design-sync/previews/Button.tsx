import { Button } from "@biume/ui/components/button"

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">Save changes</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Learn more</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>Save changes</Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
      <Button variant="destructive" disabled>
        Delete
      </Button>
    </div>
  )
}
