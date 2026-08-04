import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@biume/ui/components/navigation-menu"

export function Default() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-1">
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    Track usage and performance
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Automation</div>
                  <div className="text-xs text-muted-foreground">
                    Build workflows without code
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Integrations</div>
                  <div className="text-xs text-muted-foreground">
                    Connect your favorite tools
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1 p-1">
              <li>
                <NavigationMenuLink href="#">Documentation</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Blog</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Changelog</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function SimpleLinks() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
