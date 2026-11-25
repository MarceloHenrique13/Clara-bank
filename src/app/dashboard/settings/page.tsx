export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          SkibiriDin
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Perfil</h1>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card px-4 py-4">
        <p className="font-medium">Clara</p>
        <p className="text-sm text-muted-foreground">Modo local · casal</p>
      </section>

      <p className="text-sm text-muted-foreground">
        Auth completa e configurações avançadas entram depois. Por enquanto o
        app roda em modo guest compartilhado no mesmo banco.
      </p>
    </div>
  );
}
