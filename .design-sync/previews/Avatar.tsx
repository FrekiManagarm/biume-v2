import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@biume/ui/components/avatar"
import { CheckIcon } from "lucide-react"

export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MC</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>AP</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function WithBadge() {
  return (
    <Avatar size="lg">
      <AvatarFallback>MC</AvatarFallback>
      <AvatarBadge>
        <CheckIcon />
      </AvatarBadge>
    </Avatar>
  )
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AP</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )
}
