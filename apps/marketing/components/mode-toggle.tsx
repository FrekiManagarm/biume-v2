import { useTheme } from "next-themes";
import { Button } from "@biume/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@biume/ui/components/tooltip";
import { cn } from "@biume/ui/lib/utils";

const themes = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Systeme" },
] as const;

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 overflow-hidden rounded-full"
                  aria-label="Changer de theme"
                >
                  <ThemeIcon />
                </Button>
              }
            />
          }
        />

        <DropdownMenuContent align="end">
          {themes.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="flex items-center gap-2"
            >
              <ThemeDot active={theme === item.value} />
              <span>{item.label}</span>
              <span
                className={cn(
                  "ml-auto size-1.5 rounded-full bg-primary transition-opacity",
                  theme === item.value ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent side="bottom">Changer de theme</TooltipContent>
    </Tooltip>
  );
}

function ThemeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.125rem] text-foreground/72"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ThemeDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded-full border",
        active ? "border-primary bg-primary/10" : "border-border",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
