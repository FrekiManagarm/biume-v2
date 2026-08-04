import { Textarea } from "@biume/ui/components/textarea"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="ds-textarea-notes">Consultation notes</Label>
      <Textarea
        id="ds-textarea-notes"
        placeholder="Describe the visit, symptoms, and treatment plan..."
      />
    </div>
  )
}

export function WithValue() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="ds-textarea-filled">Message</Label>
      <Textarea
        id="ds-textarea-filled"
        defaultValue="Max is recovering well after the surgery. Please continue the antibiotics for another 5 days and schedule a follow-up next week."
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="ds-textarea-disabled">Internal notes (read-only)</Label>
      <Textarea
        id="ds-textarea-disabled"
        disabled
        defaultValue="Locked while the case is under review."
      />
    </div>
  )
}

export function Invalid() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="ds-textarea-invalid">Reason for cancellation</Label>
      <Textarea id="ds-textarea-invalid" aria-invalid placeholder="This field is required" />
      <p className="text-xs text-destructive">Please provide a reason.</p>
    </div>
  )
}
