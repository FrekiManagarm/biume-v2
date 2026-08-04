import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@biume/ui/components/native-select"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-native-species">Species</Label>
      <NativeSelect id="ds-native-species" defaultValue="dog">
        <NativeSelectOption value="dog">Dog</NativeSelectOption>
        <NativeSelectOption value="cat">Cat</NativeSelectOption>
        <NativeSelectOption value="rabbit">Rabbit</NativeSelectOption>
        <NativeSelectOption value="bird">Bird</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-native-default-size">Default</Label>
        <NativeSelect id="ds-native-default-size" defaultValue="paris">
          <NativeSelectOption value="paris">Paris</NativeSelectOption>
          <NativeSelectOption value="lyon">Lyon</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-native-sm-size">Small</Label>
        <NativeSelect id="ds-native-sm-size" size="sm" defaultValue="paris">
          <NativeSelectOption value="paris">Paris</NativeSelectOption>
          <NativeSelectOption value="lyon">Lyon</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  )
}

export function WithOptGroup() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-native-vet">Assigned veterinarian</Label>
      <NativeSelect id="ds-native-vet" defaultValue="dr-martin">
        <NativeSelectOptGroup label="Available today">
          <NativeSelectOption value="dr-martin">Dr. Martin</NativeSelectOption>
          <NativeSelectOption value="dr-nguyen">Dr. Nguyen</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="On leave">
          <NativeSelectOption value="dr-diallo">Dr. Diallo</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  )
}

export function Disabled() {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <Label htmlFor="ds-native-disabled">Plan</Label>
      <NativeSelect id="ds-native-disabled" disabled defaultValue="pro">
        <NativeSelectOption value="pro">Pro (locked)</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
