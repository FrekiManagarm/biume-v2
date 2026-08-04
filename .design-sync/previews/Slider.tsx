import { Slider } from "@biume/ui/components/slider"

export function Default() {
  return (
    <div className="w-64">
      <Slider defaultValue={[40]} />
    </div>
  )
}

export function Range() {
  return (
    <div className="w-64">
      <Slider defaultValue={[20, 70]} />
    </div>
  )
}

export function Stepped() {
  return (
    <div className="w-64">
      <Slider defaultValue={[50]} step={10} />
    </div>
  )
}

export function Disabled() {
  return (
    <div className="w-64">
      <Slider defaultValue={[35]} disabled />
    </div>
  )
}
