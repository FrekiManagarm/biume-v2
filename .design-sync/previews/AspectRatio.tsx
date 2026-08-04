import { AspectRatio } from "@biume/ui/components/aspect-ratio"

export function Widescreen() {
  return (
    <div style={{ width: 288 }}>
      <AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 border-border"
      >
        <span className="text-sm font-medium text-muted-foreground">
          16:9 cover photo
        </span>
      </AspectRatio>
    </div>
  )
}

export function Square() {
  return (
    <div style={{ width: 192 }}>
      <AspectRatio
        ratio={1}
        className="flex items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 border-border"
      >
        <span className="text-sm font-medium text-secondary-foreground">
          1:1 avatar
        </span>
      </AspectRatio>
    </div>
  )
}

export function Portrait() {
  return (
    <div style={{ width: 160 }}>
      <AspectRatio
        ratio={3 / 4}
        className="flex items-center justify-center overflow-hidden rounded-lg bg-card ring-1 border-border"
      >
        <span className="text-center text-sm font-medium text-muted-foreground">
          3:4 poster
        </span>
      </AspectRatio>
    </div>
  )
}
