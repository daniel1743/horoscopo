import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { getSavedLunarReadingsFn, deleteSavedLunarReadingFn } from "@/lib/moon/moon.functions";
import { toast } from "sonner";

const ZODIAC_NAMES: Record<string, string> = {
  aries: "Aries", taurus: "Tauro", gemini: "Géminis", cancer: "Cáncer",
  leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Escorpio",
  sagittarius: "Sagitario", capricorn: "Capricornio", aquarius: "Acuario", pisces: "Piscis"
};

export function SavedLunarReadingsPage() {
  const qc = useQueryClient();
  
  const { data, isLoading } = useQuery({ 
    queryKey: ["saved-lunar-readings"], 
    queryFn: async () => getSavedLunarReadingsFn() 
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteSavedLunarReadingFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-lunar-readings"] });
      toast.success("Lectura eliminada");
    },
    onError: () => {
      toast.error("No pudimos eliminar la lectura");
    }
  });

  const remove = (id: string) => {
    if (window.confirm("¿Eliminar esta lectura de Mis lecturas?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AccountShell
      title="Mis lecturas"
      description="Historial persistente de tus lecturas lunares guardadas."
    >
      {isLoading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-ink-soft">
          <h3 className="font-semibold text-ink mb-2">Aún no tienes lecturas guardadas</h3>
          <p>Cuando guardes una lectura lunar aparecerá aquí para que puedas volver a consultarla cuando quieras.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {data.map((r) => {
            const subtitleDate = new Intl.DateTimeFormat('es-ES', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            }).format(new Date(r.source_date + "T12:00:00Z")); // Avoid timezone shift
            
            const moonSign = ZODIAC_NAMES[r.current_moon_sign] || r.current_moon_sign;
            const natalSign = ZODIAC_NAMES[r.natal_moon_sign] || r.natal_moon_sign;

            return (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold text-ink text-[18px]">Lectura Lunar</h3>
                  <div className="mt-1 text-[14px] text-ink-muted">
                    Luna en {moonSign} &middot; {subtitleDate}
                  </div>
                  <div className="mt-3 inline-block rounded-md bg-ivory px-2 py-1 text-[13px] text-ink-soft border border-line-subtle">
                    Luna natal: {natalSign}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/mi-espacio/lecturas-lunares/${r.id}`}>
                      Ver lectura
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)} disabled={deleteMutation.isPending}>
                    Eliminar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AccountShell>
  );
}
