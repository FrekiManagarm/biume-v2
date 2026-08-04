import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu"
import { Button } from "@biume/ui/components/button"

export function Default() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">Actions</Button>} />
      <DropdownMenuContent>
        <DropdownMenuLabel>My Document</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Edit
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Duplicate
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Share
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CheckboxesAndRadio() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">View</Button>} />
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Show Sidebar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Show Status Bar</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Zoom level</DropdownMenuLabel>
        <DropdownMenuRadioGroup defaultValue="100">
          <DropdownMenuRadioItem value="75">75%</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="100">100%</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="125">125%</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function WithSubmenu() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">File</Button>} />
      <DropdownMenuContent>
        <DropdownMenuItem>New Tab</DropdownMenuItem>
        <DropdownMenuItem>New Window</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Save Page As...</DropdownMenuItem>
            <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
            <DropdownMenuItem>Developer Tools</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Close Window</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
