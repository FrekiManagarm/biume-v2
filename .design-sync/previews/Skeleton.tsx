import { Skeleton } from "@biume/ui/components/skeleton"

export function CardLoading() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function ListLoading() {
  return (
    <div className="flex w-72 flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
        </div>
      ))}
    </div>
  )
}
