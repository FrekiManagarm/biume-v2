import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  useComboboxAnchor,
} from "@biume/ui/components/combobox"

const frameworks = ["Next.js", "Remix", "Astro", "Nuxt", "SvelteKit"]

const fruitGroups = [
  { value: "citrus", items: ["Orange", "Lemon", "Grapefruit"] },
  { value: "berries", items: ["Strawberry", "Blueberry", "Raspberry"] },
]

export function Default() {
  return (
    <Combobox items={frameworks} defaultValue="Next.js" defaultOpen>
      <ComboboxChips>
        <ComboboxChipsInput placeholder="Select a framework..." />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework} value={framework}>
              {framework}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function Grouped() {
  return (
    <Combobox items={fruitGroups} defaultOpen>
      <ComboboxChips>
        <ComboboxChipsInput placeholder="Search fruit..." />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {fruitGroups.map((group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>
                {group.value === "citrus" ? "Citrus" : "Berries"}
              </ComboboxLabel>
              {group.items.map((item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              ))}
              <ComboboxSeparator />
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function MultipleWithChips() {
  const anchor = useComboboxAnchor()
  const selected = ["Strawberry", "Blueberry"]

  return (
    <Combobox
      items={fruitGroups[1]!.items}
      multiple
      defaultValue={selected}
      defaultOpen
    >
      <ComboboxChips ref={anchor as never} className="min-w-64">
        {selected.map((fruit) => (
          <ComboboxChip key={fruit}>{fruit}</ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder="Add fruit..." />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {fruitGroups[1]!.items.map((item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
