import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@biume/ui/components/alert"
import { Button } from "@biume/ui/components/button"
import { InfoIcon, TriangleAlertIcon } from "lucide-react"

export function Default() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>New version available</AlertTitle>
      <AlertDescription>
        A new version of the dashboard is ready. Refresh the page to get the
        latest features and fixes.
      </AlertDescription>
    </Alert>
  )
}

export function WithAction() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Your session is about to expire</AlertTitle>
      <AlertDescription>
        You&apos;ll be signed out in 2 minutes due to inactivity.
      </AlertDescription>
      <AlertAction>
        <Button size="sm">Stay signed in</Button>
      </AlertAction>
    </Alert>
  )
}

export function Destructive() {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>Unable to save changes</AlertTitle>
      <AlertDescription>
        Check your connection and try again. Your changes have not been
        saved.
      </AlertDescription>
    </Alert>
  )
}
