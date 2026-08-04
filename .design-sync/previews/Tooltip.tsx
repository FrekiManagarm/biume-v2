import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@biume/ui/components/tooltip"
import { Button } from "@biume/ui/components/button"
import { Kbd, KbdGroup } from "@biume/ui/components/kbd"
import { PrinterIcon } from "lucide-react"

export function Default() {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger
          render={
            <Button variant="outline" size="icon">
              <PrinterIcon />
            </Button>
          }
        />
        <TooltipContent>Print visit summary</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function WithShortcut() {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Save patient file</Button>} />
        <TooltipContent>
          Save
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
