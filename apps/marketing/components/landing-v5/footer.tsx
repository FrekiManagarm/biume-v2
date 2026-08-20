import Image from "next/image";
import Link from "next/link";

import { FOOTER_COLUMNS, FOOTER_LINE } from "./content";

export function LandingV5Footer() {
  return (
    <footer className="border-t border-[rgba(253,253,251,.1)] bg-[color:var(--lv5-anthracite)] px-[clamp(18px,4vw,34px)] py-[clamp(40px,5vw,64px)] text-[rgba(253,253,251,.62)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-10">
        <div className="flex items-center gap-2 text-[1.1rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-surface)]">
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={26}
            height={26}
            className="size-[26px] rounded-[7px]"
          />
          Biume
        </div>

        <nav
          aria-label="Pied de page"
          className="flex flex-wrap gap-[clamp(24px,4vw,64px)] text-[0.9rem]"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex min-w-[150px] flex-col gap-2.5">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[rgba(253,253,251,.4)]">
                {column.title}
              </span>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center text-[rgba(253,253,251,.62)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <p className="basis-full border-t border-[rgba(253,253,251,.1)] pt-[26px] text-[0.8rem]">
          {FOOTER_LINE}
        </p>
      </div>
    </footer>
  );
}
