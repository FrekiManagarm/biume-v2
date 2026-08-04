import { RadioGroup, RadioGroupItem } from "@biume/ui/components/radio-group"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <RadioGroup defaultValue="standard" className="w-64">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="ds-radio-standard" />
        <Label htmlFor="ds-radio-standard">Standard shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="ds-radio-express" />
        <Label htmlFor="ds-radio-express">Express shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="overnight" id="ds-radio-overnight" />
        <Label htmlFor="ds-radio-overnight">Overnight shipping</Label>
      </div>
    </RadioGroup>
  )
}

export function WithDescriptions() {
  return (
    <RadioGroup defaultValue="pro" className="w-72">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="free" id="ds-radio-plan-free" className="mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="ds-radio-plan-free">Free</Label>
          <p className="text-xs text-muted-foreground">
            Up to 3 patients, community support.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="pro" id="ds-radio-plan-pro" className="mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="ds-radio-plan-pro">Pro</Label>
          <p className="text-xs text-muted-foreground">
            Unlimited patients, priority support.
          </p>
        </div>
      </div>
    </RadioGroup>
  )
}

export function Disabled() {
  return (
    <RadioGroup defaultValue="monthly" disabled className="w-64">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="monthly" id="ds-radio-monthly" />
        <Label htmlFor="ds-radio-monthly">Monthly billing</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="yearly" id="ds-radio-yearly" />
        <Label htmlFor="ds-radio-yearly">Yearly billing</Label>
      </div>
    </RadioGroup>
  )
}
