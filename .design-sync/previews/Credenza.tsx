import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@biume/ui/components/credenza"
import { Button } from "@biume/ui/components/button"
import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <Credenza defaultOpen>
      <CredenzaTrigger render={<Button>New appointment</Button>} />
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Schedule an appointment</CredenzaTitle>
          <CredenzaDescription>
            Pick a patient and a time slot. Renders as a dialog on desktop
            and a bottom drawer on mobile.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-credenza-patient">Patient</Label>
              <Input id="ds-credenza-patient" defaultValue="Luna (Golden Retriever)" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-credenza-time">Time</Label>
              <Input id="ds-credenza-time" type="time" defaultValue="15:00" />
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Confirm booking</Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
