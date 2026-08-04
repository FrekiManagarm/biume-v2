import { Progress } from "@biume/ui/components/progress"

export function Default() {
  return (
    <div className="w-64">
      <Progress value={40} />
    </div>
  )
}

export function WithLabel() {
  return (
    <div className="w-64">
      <Progress value={68}>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium">Uploading files</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            68%
          </span>
        </div>
      </Progress>
    </div>
  )
}

export function Complete() {
  return (
    <div className="w-64">
      <Progress value={100}>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium">Backup complete</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            100%
          </span>
        </div>
      </Progress>
    </div>
  )
}

export function Empty() {
  return (
    <div className="w-64">
      <Progress value={0}>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium">Not started</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            0%
          </span>
        </div>
      </Progress>
    </div>
  )
}
