import { Kbd, KbdGroup } from "@biume/ui/components/kbd"

export function Default() {
  return <Kbd>&#8984;K</Kbd>
}

export function Combo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <KbdGroup>
        <Kbd>&#8984;</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
    </div>
  )
}
