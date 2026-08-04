import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@biume/ui/components/dialog"
import { Button } from "@biume/ui/components/button"
import { Input } from "@biume/ui/components/input"
import { Label } from "@biume/ui/components/label"

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-dialog-name">Name</Label>
            <Input id="ds-dialog-name" defaultValue="Sarah Chen" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-dialog-handle">Username</Label>
            <Input id="ds-dialog-handle" defaultValue="@sarahchen" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DestructiveConfirm() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="destructive">Delete account</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This will permanently delete your account and remove your data
            from our servers. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
