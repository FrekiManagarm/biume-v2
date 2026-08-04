import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@biume/ui/components/button-group"
import { Button } from "@biume/ui/components/button"

export function Default() {
  return (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
      <Button variant="outline">Year</Button>
    </ButtonGroup>
  )
}

export function WithText() {
  return (
    <ButtonGroup>
      <ButtonGroupText>Filter</ButtonGroupText>
      <Button variant="outline">Active</Button>
      <Button variant="outline">Archived</Button>
    </ButtonGroup>
  )
}

export function WithSeparator() {
  return (
    <ButtonGroup>
      <Button variant="ghost">Copy</Button>
      <Button variant="ghost">Paste</Button>
      <ButtonGroupSeparator />
      <Button variant="ghost">Undo</Button>
      <Button variant="ghost">Redo</Button>
    </ButtonGroup>
  )
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" className="w-40">
      <Button variant="outline">Profile</Button>
      <Button variant="outline">Billing</Button>
      <Button variant="outline">Notifications</Button>
    </ButtonGroup>
  )
}
