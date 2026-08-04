import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@biume/ui/components/tabs"

export function Default() {
  return (
    <Tabs defaultValue="account" style={{ width: 320 }}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">
          Update your name, email, and clinic details. Changes are saved
          automatically.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">
          Change your password. We recommend using at least 12 characters
          with a mix of letters and numbers.
        </p>
      </TabsContent>
      <TabsContent value="team">
        <p className="text-sm text-muted-foreground">
          Invite teammates and manage their roles across the practice.
        </p>
      </TabsContent>
    </Tabs>
  )
}

export function LineVariant() {
  return (
    <Tabs defaultValue="overview" style={{ width: 320 }}>
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="records">Records</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          A quick summary of today&apos;s appointments and pending tasks.
        </p>
      </TabsContent>
      <TabsContent value="records">
        <p className="text-sm text-muted-foreground">
          Browse patient medical history and past visit notes.
        </p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="text-sm text-muted-foreground">
          View invoices, outstanding balances, and payment methods.
        </p>
      </TabsContent>
    </Tabs>
  )
}
