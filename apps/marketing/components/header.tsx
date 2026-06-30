import Link from "next/link";
import Image from "next/image";
import { webAppPath } from "../lib/web-app-url";

const navLinks = [
  { href: "/logiciel-osteopathe-animalier", label: "Produit" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
  { href: "/tarifs", label: "Tarifs" },
];

function BiumeMark({ className = "size-7" }: { className?: string }) {
  return (
    <Image
      src="/brand/biume-logo.svg"
      alt=""
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}

export function Header() {
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-border/70 bg-background/88 px-3 py-2 shadow-[0_18px_60px_-44px_rgba(20,18,28,0.5)] backdrop-blur-xl md:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full pr-2 text-sm font-semibold tracking-tight text-foreground"
          aria-label="Biume accueil"
        >
          <BiumeMark />
          <span>Biume</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={webAppPath("/signin")}
            prefetch={false}
            className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-all hover:bg-foreground/82 active:scale-[0.98]"
          >
            Essai gratuit
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <path
                d="M3 8h9m0 0-3-3m3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
