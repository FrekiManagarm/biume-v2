import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@biume/ui/components/sheet"
import { Button } from "@biume/ui/components/button"
import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline">Edit appointment</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit appointment</SheetTitle>
          <SheetDescription>
            Update the visit details for Milo&apos;s checkup.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-sheet-date">Date</Label>
            <Input id="ds-sheet-date" type="date" defaultValue="2026-08-05" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-sheet-time">Time</Label>
            <Input id="ds-sheet-time" type="time" defaultValue="15:00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-sheet-vet">Veterinarian</Label>
            <Input id="ds-sheet-vet" defaultValue="Dr. Sarah Chen" />
          </div>
        </div>
        <SheetFooter>
          <Button>Save changes</Button>
          <SheetClose render={<Button variant="outline">Cancel</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
