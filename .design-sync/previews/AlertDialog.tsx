import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@biume/ui/components/alert-dialog"
import { Button } from "@biume/ui/components/button"
import { TriangleAlertIcon } from "lucide-react"

export function Default() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger render={<Button variant="destructive">Delete patient record</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this patient record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove Luna&apos;s file, including her visit
            history and vaccination records. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete record</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function WithMedia() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger render={<Button variant="outline">Cancel appointment</Button>} />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            The 3:00 PM checkup for Milo will be removed from today&apos;s
            schedule.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Cancel appointment</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
