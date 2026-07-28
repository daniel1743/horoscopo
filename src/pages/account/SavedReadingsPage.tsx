import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { listSavedReadings, deleteSavedReading } from "@/lib/account/repository";
import { toast } from "sonner";

const spreadLabels: Record<string, string> = {
  daily: "Carta del día",
  yes_no: "Sí o no",
  three_cards: "Tres cartas",
};

export function SavedReadingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["saved-readings"], queryFn: listSavedReadings });

  const remove = async (id: string) => {
    try {
      await deleteSavedReading(id);
      qc.invalidateQueries({ queryKey: ["saved-readings"] });
      toast.success("Lectura eliminada");
    } catch {
      toast.error("No pudimos eliminar la lectura");
    }
  };

  return (
    <AccountShell
      title="Lecturas guardadas"
      description="Solo las lecturas de tarot que decidiste conservar. Nunca guardamos tu pregunta."
    >
      {isLoading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-ink-soft">
          Aún no has guardado ninguna lectura. Cuando termines una tirada de tarot podrás elegir guardarla aquí.
        </div>
      ) : (
        <ul className="space-y-4">
          {data.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-ink-muted">
                    {spreadLabels[r.spread_type] ?? r.spread_type}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {r.cards.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-ink"
                      >
                        {c.position ? `${c.position}: ` : ""}
                        {c.slug}
                        {c.reversed ? " (inv.)" : ""}
                      </span>
                    ))}
                  </div>
                  {r.interpretation && (
                    <p className="mt-3 text-sm text-ink-soft">{r.interpretation}</p>
                  )}
                  {r.note && (
                    <p className="mt-2 text-sm italic text-ink-muted">Nota: {r.note}</p>
                  )}
                  <div className="mt-2 text-xs text-ink-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
