import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@biume/ui/components/menubar"

export function Default() {
  return (
    <Menubar>
      <MenubarMenu defaultOpen>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email Link</MenubarItem>
              <MenubarItem>Copy Link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">
            Close Window
            <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Reload</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export function ViewMenuOpen() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu defaultOpen>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Appearance</MenubarLabel>
          <MenubarCheckboxItem checked>Show Sidebar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show Status Bar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup defaultValue="100">
            <MenubarRadioItem value="75">75%</MenubarRadioItem>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="125">125%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
