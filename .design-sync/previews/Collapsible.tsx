import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@biume/ui/components/collapsible"
import { Button } from "@biume/ui/components/button"

export function Default() {
  return (
    <Collapsible
      defaultOpen
      className="rounded-lg border"
      style={{ width: 320, padding: 12 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          3 upcoming appointments this week
        </p>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="sm">
              Toggle
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="rounded-md border px-3 py-2">
          Milo (dog) — vaccination, Tue 10:00
        </div>
        <div className="rounded-md border px-3 py-2">
          Luna (cat) — annual checkup, Wed 14:30
        </div>
        <div className="rounded-md border px-3 py-2">
          Rex (dog) — dental cleaning, Fri 09:15
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
