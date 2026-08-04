import { Spinner } from "@biume/ui/components/spinner"
import { Button } from "@biume/ui/components/button"

export function Default() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading...
    </div>
  )
}

export function InButton() {
  return (
    <Button disabled size="sm">
      <Spinner />
      Saving changes
    </Button>
  )
}
