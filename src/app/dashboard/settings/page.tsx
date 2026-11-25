export const metadata = {
  title: "Perfil · SkibiriDin",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-2xl md:px-6">
      <div>
        <p className="text-sm font-medium text-brand">SkibiriDin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Perfil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conta compartilhada do casal. Em breve: membros, preferências e
          notificações.
        </p>
      </div>
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <p className="text-sm font-medium text-primary">Família</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vocês dois no mesmo orçamento. Convites e papéis chegam na próxima
          etapa.
        </p>
      </div>
    </div>
  );
}
