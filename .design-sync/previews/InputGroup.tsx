import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@biume/ui/components/input-group"
import { SearchIcon, CopyIcon, SendHorizonalIcon } from "lucide-react"

export function Search() {
  return (
    <InputGroup className="w-64">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search patients..." />
    </InputGroup>
  )
}

export function WithSuffix() {
  return (
    <InputGroup className="w-64">
      <InputGroupInput defaultValue="acme-vet-clinic" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.biume.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function WithButton() {
  return (
    <InputGroup className="w-72">
      <InputGroupInput defaultValue="sk_live_51Hc9fZ..." readOnly />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>
          <CopyIcon />
          Copy
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function TextareaWithAction() {
  return (
    <InputGroup className="w-72">
      <InputGroupTextarea placeholder="Write a note about this consultation..." />
      <InputGroupAddon align="block-end">
        <InputGroupButton variant="default" size="sm">
          <SendHorizonalIcon />
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
