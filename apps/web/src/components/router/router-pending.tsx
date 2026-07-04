function RouterPendingComponent() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-background px-6 text-foreground"
    >
      <div className="flex w-full max-w-52 flex-col items-center gap-5">
        <img
          src="/assets/images/biume-logo.png"
          alt=""
          className="size-10 rounded-xl"
          width={40}
          height={40}
        />

        <div className="grid gap-1 text-center">
          <p className="text-sm font-medium tracking-tight">Chargement</p>
          <p className="text-xs text-muted-foreground">Un instant.</p>
        </div>

        <div className="h-px w-full overflow-hidden rounded-full bg-border">
          <div className="h-full w-full animate-pulse rounded-full bg-foreground/60" />
        </div>
      </div>
    </main>
  );
}

export { RouterPendingComponent };
