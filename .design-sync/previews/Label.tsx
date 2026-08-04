import { Label } from "@biume/ui/components/label"
import { Input } from "@biume/ui/components/input"
import { Checkbox } from "@biume/ui/components/checkbox"

export function Default() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="ds-label-email">Email address</Label>
      <Input id="ds-label-email" type="email" placeholder="you@example.com" />
    </div>
  )
}

export function WithCheckbox() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="ds-label-terms" />
      <Label htmlFor="ds-label-terms">Accept terms and conditions</Label>
    </div>
  )
}

export function Required() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="ds-label-required">
        Clinic name <span className="text-destructive">*</span>
      </Label>
      <Input id="ds-label-required" placeholder="Sunrise Veterinary Clinic" />
    </div>
  )
}

export function Disabled() {
  return (
    <div className="group flex items-center gap-2" data-disabled="true">
      <Checkbox id="ds-label-disabled" disabled />
      <Label htmlFor="ds-label-disabled">Unavailable on your plan</Label>
    </div>
  )
}
