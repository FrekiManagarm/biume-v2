import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
} from "@biume/ui/components/item"
import { Button } from "@biume/ui/components/button"
import { Avatar, AvatarFallback } from "@biume/ui/components/avatar"
import { PawPrintIcon } from "lucide-react"

export function Default() {
  return (
    <ItemGroup className="w-80">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <PawPrintIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Milo</ItemTitle>
          <ItemDescription>Golden Retriever &middot; 4 years</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            View
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemMedia variant="icon">
          <PawPrintIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Nala</ItemTitle>
          <ItemDescription>Domestic Shorthair &middot; 2 years</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            View
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}

export function WithAvatarMedia() {
  return (
    <ItemGroup className="w-80">
      <Item variant="muted">
        <ItemMedia>
          <Avatar>
            <AvatarFallback>MC</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Mathieu Chambaud</ItemTitle>
          <ItemDescription>Veterinarian &middot; Clinic Owner</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  )
}
