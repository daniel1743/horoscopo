import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  deleteSavedReading,
  listSavedReadings,
  updateSavedReadingNote,
  type SavedReading,
  type SpreadType,
} from "@/lib/account/repository";
import { toast } from "sonner";

type ReadingFilter = "all" | SpreadType;
type ReadingDateFilter = "all" | "30d" | "90d";

const spreadLabels: Record<SpreadType, string> = {
  daily: "Carta del día",
  yes_no: "Sí o no",
  three_cards: "Tres cartas",
  decision: "Tarot para una decisión",
  past_present_future: "Pasado, presente y futuro",
};

const filterOptions: Array<{ key: ReadingFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "daily", label: "Carta del día" },
  { key: "yes_no", label: "Sí o no" },
  { key: "three_cards", label: "Tres cartas" },
  { key: "decision", label: "Tarot para una decisión" },
  { key: "past_present_future", label: "Pasado, presente y futuro" },
];

export function SavedReadingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["saved-readings"],
    queryFn: listSavedReadings,
  });
  const [filter, setFilter] = useState<ReadingFilter>("all");
  const [dateFilter, setDateFilter] = useState<ReadingDateFilter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const readings = useMemo(() => {
    const all = data ?? [];
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const cutoff =
      dateFilter === "all"
        ? null
        : Date.now() - (dateFilter === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000;
    return all.filter((reading) => {
      if (filter !== "all" && reading.spread_type !== filter) return false;
      if (cutoff !== null && new Date(reading.created_at).getTime() < cutoff) return false;
      if (!normalizedSearch) return true;
      const searchable = [
        reading.interpretation ?? "",
        reading.note ?? "",
        ...reading.cards.map((card) => `${card.slug} ${card.position ?? ""}`),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [data, dateFilter, filter, search]);

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      reversedCards: all.reduce(
        (count, reading) => count + reading.cards.filter((card) => card.reversed).length,
        0,
      ),
      withNotes: all.filter((reading) => Boolean(reading.note?.trim())).length,
    };
  }, [data]);

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await deleteSavedReading(id);
      await qc.invalidateQueries({ queryKey: ["saved-readings"] });
      toast.success("Lectura eliminada");
    } catch {
      toast.error("No pudimos eliminar la lectura");
    } finally {
      setBusyId(null);
    }
  };

  const startEditing = (reading: SavedReading) => {
    setEditingId(reading.id);
    setDraftNote(reading.note ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftNote("");
  };

  const saveNote = async (id: string) => {
    setBusyId(id);
    try {
      await updateSavedReadingNote(id, draftNote.trim() || null);
      await qc.invalidateQueries({ queryKey: ["saved-readings"] });
      cancelEditing();
      toast.success("Nota actualizada");
    } catch {
      toast.error("No pudimos actualizar tu nota");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AccountShell
      title="Diario de tarot"
      description="Un espacio privado para conservar tus lecturas y añadir lo que observaste después. Nunca guardamos tu pregunta original."
    >
      <div className="space-y-6">
        <section
          aria-labelledby="reading-privacy-title"
          className="rounded-[var(--radius-card)] border border-line-soft bg-parchment-elevated p-5"
        >
          <h2 id="reading-privacy-title" className="font-display text-[20px] text-ink">
            Tu registro, bajo tu control
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Guardar una lectura requiere una acción explícita. Puedes editar o eliminar tus notas
            cuando quieras; compartir una lectura en Comunidad es una decisión independiente.
          </p>
        </section>

        <section aria-labelledby="reading-stats-title">
          <h2 id="reading-stats-title" className="sr-only">
            Resumen privado de tu diario
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-warm-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Lecturas</p>
              <p className="mt-1 font-display text-[24px] text-ink">{stats.total}</p>
            </div>
            <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-warm-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Cartas invertidas
              </p>
              <p className="mt-1 font-display text-[24px] text-ink">{stats.reversedCards}</p>
            </div>
            <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-warm-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Con notas
              </p>
              <p className="mt-1 font-display text-[24px] text-ink">{stats.withNotes}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="reading-search-title"
          className="rounded-[var(--radius-card)] border border-line-soft bg-parchment-elevated p-5"
        >
          <h2 id="reading-search-title" className="font-display text-[20px] text-ink">
            Encuentra una lectura
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              <span>Buscar en cartas, interpretación o notas</span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Por ejemplo: luna, próximo paso…"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              <span>Periodo</span>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value as ReadingDateFilter)}
                className="h-10 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-cosmic/50"
              >
                <option value="all">Todo el diario</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar diario">
          <span className="mr-1 text-sm font-medium text-ink">Tipo:</span>
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              type="button"
              size="sm"
              variant={filter === option.key ? "secondary" : "outline"}
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-ink-soft">Cargando tu diario…</p>
        ) : isError ? (
          <p role="alert" className="text-error">
            No pudimos cargar tus lecturas. Intenta de nuevo más tarde.
          </p>
        ) : readings.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-ink-soft">
            {filter === "all"
              ? "Aún no has guardado ninguna lectura. Cuando termines una tirada de tarot podrás elegir guardarla aquí."
              : `No hay lecturas guardadas del tipo «${spreadLabels[filter]}».`}
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Lecturas privadas guardadas">
            {readings.map((reading) => {
              const isEditing = editingId === reading.id;
              const isBusy = busyId === reading.id;
              return (
                <li
                  key={reading.id}
                  className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-cosmic">
                          {spreadLabels[reading.spread_type]}
                        </span>
                        <time dateTime={reading.created_at} className="text-xs text-ink-muted">
                          {new Date(reading.created_at).toLocaleString()}
                        </time>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2" aria-label="Cartas de la lectura">
                        {reading.cards.map((card, index) => (
                          <span
                            key={`${reading.id}-${card.slug}-${index}`}
                            className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-ink"
                          >
                            {card.position ? `${card.position}: ` : ""}
                            {card.slug}
                            {card.reversed ? " · invertida" : " · al derecho"}
                          </span>
                        ))}
                      </div>

                      {reading.interpretation ? (
                        <div className="mt-4">
                          <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                            Lectura
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                            {reading.interpretation}
                          </p>
                        </div>
                      ) : null}

                      {isEditing ? (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor={`reading-note-${reading.id}`}>Tu nota privada</Label>
                          <Textarea
                            id={`reading-note-${reading.id}`}
                            value={draftNote}
                            onChange={(event) => setDraftNote(event.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="¿Qué observaste después de la lectura?"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveNote(reading.id)}
                              disabled={isBusy}
                            >
                              {isBusy ? "Guardando…" : "Guardar nota"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              disabled={isBusy}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : reading.note ? (
                        <div className="mt-4 rounded-[var(--radius-control)] bg-ivory p-3">
                          <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                            Tu nota
                          </h3>
                          <p className="mt-1 text-sm italic leading-relaxed text-ink-soft">
                            {reading.note}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-ink-muted">
                          Todavía no has añadido una nota a esta lectura.
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                      {!isEditing ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(reading)}
                        >
                          {reading.note ? "Editar nota" : "Añadir nota"}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(reading.id)}
                        disabled={isBusy || isEditing}
                      >
                        {isBusy && !isEditing ? "Eliminando…" : "Eliminar"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AccountShell>
  );
}
