import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@biume/ui/components/drawer"
import { Button } from "@biume/ui/components/button"
import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <Drawer defaultOpen>
      <DrawerTrigger render={<Button variant="outline">Quick add patient</Button>} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add a new patient</DrawerTitle>
          <DrawerDescription>
            Enter the essentials now, you can fill in the rest of the file
            later.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-drawer-name">Patient name</Label>
            <Input id="ds-drawer-name" defaultValue="Milo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-drawer-owner">Owner</Label>
            <Input id="ds-drawer-owner" defaultValue="Claire Dubois" />
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Save patient</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
