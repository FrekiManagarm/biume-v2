import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@biume/ui/components/resizable"

export function Horizontal() {
  return (
    <ResizablePanelGroup
      className="rounded-lg border"
      style={{ height: 224, width: 384 }}
    >
      <ResizablePanel defaultSize={35} minSize={20}>
        <div
          className="flex h-full flex-col gap-1 text-sm"
          style={{ padding: 12 }}
        >
          <p className="font-medium">Patients</p>
          <p className="text-muted-foreground">Milo</p>
          <p className="text-muted-foreground">Luna</p>
          <p className="text-muted-foreground">Rex</p>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65}>
        <div
          className="flex h-full flex-col gap-1 text-sm"
          style={{ padding: 12 }}
        >
          <p className="font-medium">Record — Milo</p>
          <p className="text-muted-foreground">
            Golden retriever, 4 years old. Last visit: annual vaccination,
            all clear. Next checkup due in 6 months.
          </p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function ThreeColumns() {
  return (
    <ResizablePanelGroup
      className="rounded-lg border"
      style={{ height: 224, width: 384 }}
    >
      <ResizablePanel defaultSize={25} minSize={15}>
        <div
          className="flex h-full items-center justify-center text-sm text-muted-foreground"
          style={{ padding: 12 }}
        >
          Sidebar
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div
          className="flex h-full items-center justify-center text-sm text-muted-foreground"
          style={{ padding: 12 }}
        >
          Main content
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div
          className="flex h-full items-center justify-center text-sm text-muted-foreground"
          style={{ padding: 12 }}
        >
          Details
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
