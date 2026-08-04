import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@biume/ui/components/select"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-select-species">Species</Label>
      <Select defaultValue="dog">
        <SelectTrigger id="ds-select-species" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dog">Dog</SelectItem>
          <SelectItem value="cat">Cat</SelectItem>
          <SelectItem value="rabbit">Rabbit</SelectItem>
          <SelectItem value="bird">Bird</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function Open() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-select-open-vet">Assigned veterinarian</Label>
      <Select defaultValue="dr-nguyen" defaultOpen>
        <SelectTrigger id="ds-select-open-vet" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available today</SelectLabel>
            <SelectItem value="dr-martin">Dr. Martin</SelectItem>
            <SelectItem value="dr-nguyen">Dr. Nguyen</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>On leave</SelectLabel>
            <SelectItem value="dr-diallo">Dr. Diallo</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-select-size-default">Default</Label>
        <Select defaultValue="paris">
          <SelectTrigger id="ds-select-size-default">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paris">Paris</SelectItem>
            <SelectItem value="lyon">Lyon</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-select-size-sm">Small</Label>
        <Select defaultValue="paris">
          <SelectTrigger id="ds-select-size-sm" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paris">Paris</SelectItem>
            <SelectItem value="lyon">Lyon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-select-disabled">Plan</Label>
      <Select defaultValue="pro" disabled>
        <SelectTrigger id="ds-select-disabled" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
