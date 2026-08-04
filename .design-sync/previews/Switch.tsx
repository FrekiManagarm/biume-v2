import { Switch } from "@biume/ui/components/switch"
import { Label } from "@biume/ui/components/label"

export function Off() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="ds-switch-off" />
      <Label htmlFor="ds-switch-off">Email notifications</Label>
    </div>
  )
}

export function On() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="ds-switch-on" defaultChecked />
      <Label htmlFor="ds-switch-on">Marketing emails</Label>
    </div>
  )
}

export function Small() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="ds-switch-sm" size="sm" defaultChecked />
      <Label htmlFor="ds-switch-sm">Compact mode</Label>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch id="ds-switch-disabled-off" disabled />
        <Label htmlFor="ds-switch-disabled-off">Unavailable on your plan</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="ds-switch-disabled-on" disabled defaultChecked />
        <Label htmlFor="ds-switch-disabled-on">Always enabled</Label>
      </div>
    </div>
  )
}
