import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@biume/ui/components/card"
import { Badge } from "@biume/ui/components/badge"
import { Button } from "@biume/ui/components/button"

export function Pricing() {
  return (
    <Card style={{ width: 288 }}>
      <CardHeader>
        <CardTitle>Pro plan</CardTitle>
        <CardDescription>
          For growing practices that need more automation.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">Popular</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          $49
          <span className="text-sm font-medium text-muted-foreground">
            /mo
          </span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlimited appointments, automated reminders, and priority support.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Upgrade to Pro</Button>
      </CardFooter>
    </Card>
  )
}

export function Settings() {
  return (
    <Card style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage how the team is notified about appointment changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Email reminders</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>SMS reminders</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Daily summary</span>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </CardFooter>
    </Card>
  )
}
