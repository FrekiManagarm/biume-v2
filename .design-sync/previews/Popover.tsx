import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@biume/ui/components/popover"
import { Button } from "@biume/ui/components/button"
import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button variant="outline">Set reminder</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Follow-up reminder</PopoverTitle>
          <PopoverDescription>
            We&apos;ll notify the front desk before Luna&apos;s next visit.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ds-popover-date">Remind on</Label>
          <Input id="ds-popover-date" type="date" defaultValue="2026-08-16" />
        </div>
        <Button size="sm" className="self-end">Save reminder</Button>
      </PopoverContent>
    </Popover>
  )
}
