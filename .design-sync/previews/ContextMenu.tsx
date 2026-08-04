import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@biume/ui/components/context-menu"

export function Default() {
  return (
    <ContextMenu defaultOpen>
      <ContextMenuTrigger className="flex h-32 w-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Clear browsing data</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function WithSubmenuAndCheckboxes() {
  return (
    <ContextMenu defaultOpen>
      <ContextMenuTrigger className="flex h-32 w-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>View options</ContextMenuLabel>
        <ContextMenuCheckboxItem checked>Show Bookmarks Bar</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup defaultValue="medium">
          <ContextMenuRadioItem value="small">Small text</ContextMenuRadioItem>
          <ContextMenuRadioItem value="medium">Medium text</ContextMenuRadioItem>
          <ContextMenuRadioItem value="large">Large text</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy Link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
