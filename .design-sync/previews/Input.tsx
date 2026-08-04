import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <div className="flex w-64 flex-col gap-1.5">
      <Label htmlFor="ds-input-email">Email</Label>
      <Input id="ds-input-email" type="email" placeholder="you@example.com" />
    </div>
  )
}

export function Types() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-input-name">Name</Label>
        <Input id="ds-input-name" defaultValue="Sarah Chen" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-input-password">Password</Label>
        <Input id="ds-input-password" type="password" defaultValue="hunter2222" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-input-age">Age</Label>
        <Input id="ds-input-age" type="number" defaultValue={32} />
      </div>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex w-64 flex-col gap-1.5">
      <Label htmlFor="ds-input-disabled">Workspace URL</Label>
      <Input id="ds-input-disabled" disabled defaultValue="acme.biume.com" />
    </div>
  )
}

export function Invalid() {
  return (
    <div className="flex w-64 flex-col gap-1.5">
      <Label htmlFor="ds-input-invalid">Email</Label>
      <Input id="ds-input-invalid" aria-invalid defaultValue="not-an-email" />
      <p className="text-xs text-destructive">Enter a valid email address.</p>
    </div>
  )
}
