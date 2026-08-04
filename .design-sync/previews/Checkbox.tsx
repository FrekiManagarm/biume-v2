import { Checkbox } from "@biume/ui/components/checkbox"
import { Label } from "@biume/ui/components/label"

export function Unchecked() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="ds-cb-unchecked" />
      <Label htmlFor="ds-cb-unchecked">Accept terms and conditions</Label>
    </div>
  )
}

export function Checked() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="ds-cb-checked" defaultChecked />
      <Label htmlFor="ds-cb-checked">Email me about product updates</Label>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex flex-col gap-2">
      <div className="group flex items-center gap-2">
        <Checkbox id="ds-cb-disabled-off" disabled />
        <Label htmlFor="ds-cb-disabled-off">Unavailable on your plan</Label>
      </div>
      <div className="group flex items-center gap-2">
        <Checkbox id="ds-cb-disabled-on" disabled defaultChecked />
        <Label htmlFor="ds-cb-disabled-on">Required, cannot be changed</Label>
      </div>
    </div>
  )
}
