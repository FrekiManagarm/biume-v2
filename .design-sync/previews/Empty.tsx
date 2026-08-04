import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@biume/ui/components/empty"
import { Button } from "@biume/ui/components/button"
import { InboxIcon, SearchXIcon } from "lucide-react"

export function Default() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No appointments yet</EmptyTitle>
        <EmptyDescription>
          Appointments you schedule for your patients will show up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Schedule an appointment</Button>
      </EmptyContent>
    </Empty>
  )
}

export function NoResults() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find what you&apos;re
          looking for.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
