import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import {
  PENDING_TAROT_READING_SAVE_KEY,
  PENDING_LUNAR_READING_SAVE_KEY,
  listSavedReadings,
  deleteSavedReading,
  fetchPrivacySettings,
  saveTarotReading,
  type SavedReadingCard,
} from "@/lib/account/repository";
import { routes } from "@/config/routes";
import { toast } from "sonner";

const spreadLabels: Record<string, string> = {
  daily: "Carta del día",
  yes_no: "Sí o no",
  three_cards: "Tres cartas",
};

interface PendingTarotReadingSave {
  spreadType: "three_cards";
  cards: SavedReadingCard[];
  interpretation: string | null;
  createdAt: string;
}

function readPendingTarotReadingSave(): PendingTarotReadingSave | null {
  const raw = sessionStorage.getItem(PENDING_TAROT_READING_SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingTarotReadingSave>;
    if (
      parsed.spreadType !== "three_cards" ||
      !Array.isArray(parsed.cards) ||
      parsed.cards.length !== 3
    ) {
      return null;
    }
    return {
      spreadType: parsed.spreadType,
      cards: parsed.cards,
      interpretation: typeof parsed.interpretation === "string" ? parsed.interpretation : null,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function SavedReadingsPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const qc = useQueryClient();
  const pendingHandled = useRef(false);
  const { data, isLoading } = useQuery({
    queryKey: ["saved-readings", user?.id ?? "anon"],
    queryFn: listSavedReadings,
  });

  useEffect(() => {
    if (!user || pendingHandled.current) return;
    const pending = readPendingTarotReadingSave();

    const consumeChain = () => {
      if (sessionStorage.getItem("creovision:chain-to-lunar")) {
        sessionStorage.removeItem("creovision:chain-to-lunar");
        if (sessionStorage.getItem(PENDING_LUNAR_READING_SAVE_KEY)) {
          navigate({ to: routes.savedLunarReadings, replace: true });
        }
      }
    };

    if (!pending) {
      consumeChain();
      return;
    }

    pendingHandled.current = true;
    void (async () => {
      try {
        const privacy = await fetchPrivacySettings(user.id);
        if (!privacy.save_readings_allowed) {
          toast.error("Guardar lecturas está desactivado en tus preferencias de privacidad.");
          return;
        }
        await saveTarotReading({
          userId: user.id,
          spreadType: pending.spreadType,
          cards: pending.cards,
          interpretation: pending.interpretation,
        });
        sessionStorage.removeItem(PENDING_TAROT_READING_SAVE_KEY);
        qc.invalidateQueries({ queryKey: ["saved-readings", user?.id ?? "anon"] });
        toast.success("Lectura guardada en Mi espacio.");
      } catch (error) {
        pendingHandled.current = false;
        console.error(error);
        toast.error("No pudimos guardar la lectura pendiente.");
      } finally {
        consumeChain();
      }
    })();
  }, [qc, user, navigate]);

  const remove = async (id: string) => {
    try {
      await deleteSavedReading(id);
      qc.invalidateQueries({ queryKey: ["saved-readings", user?.id ?? "anon"] });
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
          Aún no has guardado ninguna lectura. Cuando termines una tirada de tarot podrás elegir
          guardarla aquí.
        </div>
      ) : (
        <ul className="space-y-4">
          {data.map((r) => (
            <li
              key={r.id}
              className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4"
            >
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
                        {c.name ?? c.slug}
                        {c.reversed ? " (inv.)" : ""}
                      </span>
                    ))}
                  </div>
                  {r.interpretation && (
                    <p className="mt-3 text-sm text-ink-soft">{r.interpretation}</p>
                  )}
                  {r.note && <p className="mt-2 text-sm italic text-ink-muted">Nota: {r.note}</p>}
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
