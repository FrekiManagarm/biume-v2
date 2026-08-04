import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@biume/ui/components/hover-card"
import { Avatar, AvatarFallback } from "@biume/ui/components/avatar"
import { Badge } from "@biume/ui/components/badge"

export function Default() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger
        render={
          <button className="text-sm font-medium text-foreground underline underline-offset-4">
            Dr. Sarah Chen
          </button>
        }
      />
      <HoverCardContent>
        <div className="flex gap-3">
          <Avatar size="lg">
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Dr. Sarah Chen</p>
            <p className="text-sm text-muted-foreground">
              Veterinarian, small animal medicine. 12 years of practice.
            </p>
            <Badge variant="secondary" className="mt-1 w-fit">
              On call today
            </Badge>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
