function RouterPendingComponent() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/assets/images/biume-logo.png"
              alt=""
              className="size-9 shrink-0 rounded-lg"
              width={36}
              height={36}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">Biume</p>
              <p className="text-xs text-muted-foreground">
                Préparation de l'espace
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-secondary animate-pulse" />
            Chargement
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-5">
            <div className="grid gap-3 border-b border-border pb-5 pt-2">
              <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-full max-w-sm rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-full max-w-2xl rounded-full bg-muted animate-pulse" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid flex-1 gap-2">
                      <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />
                      <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
                    </div>
                    <div className="size-9 rounded-lg bg-muted animate-pulse" />
                  </div>
                  <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>

            <div className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
              <div className="flex items-center justify-between gap-4">
                <div className="grid flex-1 gap-2">
                  <div className="h-4 w-40 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-full max-w-md rounded-full bg-muted animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
              </div>

              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)_5rem] items-center gap-3 border-t border-border pt-3"
                  >
                    <div className="size-10 rounded-lg bg-muted animate-pulse" />
                    <div className="grid gap-2">
                      <div className="h-3 w-full max-w-xs rounded-full bg-muted animate-pulse" />
                      <div className="h-3 w-2/3 rounded-full bg-muted animate-pulse" />
                    </div>
                    <div className="h-7 rounded-md bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="hidden gap-4 border-l border-border pl-6 lg:grid">
            <div className="grid gap-3">
              <div className="h-4 w-32 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-full rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-muted animate-pulse" />
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="size-8 rounded-full bg-muted animate-pulse" />
                  <div className="grid gap-2">
                    <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-full rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export { RouterPendingComponent };
