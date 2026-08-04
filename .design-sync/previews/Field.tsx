import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@biume/ui/components/field"
import { Input } from "@biume/ui/components/input"
import { Switch } from "@biume/ui/components/switch"

export function Default() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Owner details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="ds-field-name">Full name</FieldLabel>
          <Input id="ds-field-name" defaultValue="Camille Laurent" />
          <FieldDescription>
            As it appears on the client record.
          </FieldDescription>
        </Field>
        <FieldSeparator />
        <Field>
          <FieldLabel htmlFor="ds-field-email">Email</FieldLabel>
          <Input
            id="ds-field-email"
            type="email"
            defaultValue="camille@example.com"
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

export function Invalid() {
  return (
    <Field data-invalid="true" className="w-full max-w-sm">
      <FieldLabel htmlFor="ds-field-phone">Phone number</FieldLabel>
      <Input id="ds-field-phone" defaultValue="06 12" aria-invalid="true" />
      <FieldError>Enter a valid phone number.</FieldError>
    </Field>
  )
}

export function Horizontal() {
  return (
    <Field orientation="horizontal" className="w-full max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="ds-field-notify">Email notifications</FieldLabel>
        <FieldDescription>
          Receive updates about upcoming appointments.
        </FieldDescription>
      </FieldContent>
      <Switch id="ds-field-notify" defaultChecked />
    </Field>
  )
}
