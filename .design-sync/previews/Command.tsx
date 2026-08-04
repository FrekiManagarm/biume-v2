import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@biume/ui/components/command"

export function Default() {
  return (
    <Command className="w-72 rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Billing
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Settings
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function EmptyState() {
  return (
    <Command className="w-72 rounded-lg border shadow-md">
      <CommandInput placeholder="Search for “xyz”..." defaultValue="xyz" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
