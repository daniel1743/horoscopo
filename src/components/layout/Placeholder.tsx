import { PageShell } from "./PageShell";
import { PageHeader } from "./PageHeader";

interface Props {
  eyebrow?: string;
  title: string;
  description: string;
}

/** Superficie mínima para rutas aún no construidas. */
export function Placeholder({ eyebrow = "Próximamente", title, description }: Props) {
  return (
    <PageShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-8 text-center shadow-card">
        <p className="font-body text-[15px] text-ink-soft">
          Esta sección está en preparación y estará disponible próximamente.
        </p>
      </div>
    </PageShell>
  );
}
