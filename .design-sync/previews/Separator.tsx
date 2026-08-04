import { Separator } from "@biume/ui/components/separator"

export function Horizontal() {
  return (
    <div className="w-72">
      <div className="text-sm">
        <p className="font-medium">Biume Inc.</p>
        <p className="text-muted-foreground">Veterinary practice management</p>
      </div>
      <Separator className="my-2" />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Docs</span>
        <span>API</span>
        <span>Support</span>
      </div>
    </div>
  )
}

export function Vertical() {
  return (
    <div className="flex h-8 items-center gap-4 text-sm">
      <span>Appointments</span>
      <Separator orientation="vertical" />
      <span>Patients</span>
      <Separator orientation="vertical" />
      <span>Billing</span>
    </div>
  )
}
