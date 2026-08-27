import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { communityPostTypeLabels, communityReportReasons } from "@/config/community";
import {
  listOpenCommunityReports,
  moderateCommunityReport,
  type CommunityModerationReport,
} from "@/lib/account/repository";
import { routes } from "@/config/routes";
import { toast } from "sonner";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const reasonLabel = (reason: CommunityModerationReport["report_reason"]) =>
  communityReportReasons.find((item) => item.value === reason)?.label ?? reason;

export function CommunityModerationPage() {
  const queryClient = useQueryClient();
  const [noteByReport, setNoteByReport] = useState<Record<string, string>>({});
  const [busyReport, setBusyReport] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["admin", "community-reports"],
    queryFn: () => listOpenCommunityReports(50),
    staleTime: 1000 * 30,
  });

  const resolve = async (report: CommunityModerationReport, decision: "dismiss" | "hide") => {
    if (decision === "hide" && !window.confirm("¿Ocultar esta publicación del muro?")) return;
    setBusyReport(report.report_id);
    try {
      const changed = await moderateCommunityReport({
        reportId: report.report_id,
        decision,
        note: noteByReport[report.report_id] ?? null,
      });
      if (!changed) {
        toast("Este reporte ya había sido resuelto por otra persona.");
      } else {
        toast.success(
          decision === "hide" ? "Publicación ocultada del muro." : "Reporte descartado.",
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "community-reports"] });
    } catch {
      toast.error("No pudimos actualizar el reporte. Comprueba tus permisos.");
    } finally {
      setBusyReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-caption uppercase tracking-wide text-brand">Seguridad comunitaria</p>
        <h1 className="text-h2 text-ink">Reportes del muro</h1>
        <p className="max-w-[68ch] text-body text-ink-soft">
          Revisa primero el contexto, aplica una decisión proporcional y deja una nota interna
          cuando ayude a la siguiente revisión. Esta bandeja solo debe estar disponible para roles
          autorizados.
        </p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft/30 p-4 text-sm leading-relaxed text-ink-soft">
        Ocultar una publicación la retira del feed público sin eliminarla. El reporte y la decisión
        quedan registrados en la auditoría administrativa.
      </div>

      {query.isLoading && <p className="text-body text-ink-soft">Cargando reportes abiertos…</p>}
      {query.isError && (
        <div className="rounded-[var(--radius-card)] border border-line bg-warm-white p-6">
          <h2 className="text-h4 text-ink">No se pudo cargar la bandeja</h2>
          <p className="mt-2 text-body text-ink-soft">
            Comprueba que la migración de moderación esté aplicada y que tu cuenta tenga rol de
            admin o editor.
          </p>
        </div>
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-8 text-center">
          <h2 className="text-h4 text-ink">No hay reportes abiertos</h2>
          <p className="mt-2 text-body text-ink-soft">La bandeja está al día.</p>
        </div>
      )}

      <div className="space-y-4">
        {query.data?.map((report) => {
          const busy = busyReport === report.report_id;
          return (
            <article
              key={report.report_id}
              className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-caption uppercase tracking-wide text-error">Reporte abierto</p>
                  <h2 className="mt-1 text-h4 text-ink">{reasonLabel(report.report_reason)}</h2>
                </div>
                <time dateTime={report.reported_at} className="text-caption text-ink-muted">
                  {formatDate(report.reported_at)}
                </time>
              </div>
              <div className="mt-5 rounded-[var(--radius-control)] bg-ivory/70 p-4">
                <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
                  <span>{communityPostTypeLabels[report.post_type]}</span>
                  <span aria-hidden>·</span>
                  <span>
                    Autor:{" "}
                    {report.author_username ? `@${report.author_username}` : "perfil privado"}
                  </span>
                </div>
                {report.post_title && (
                  <h3 className="mt-2 text-h4 text-ink">{report.post_title}</h3>
                )}
                <p className="mt-2 whitespace-pre-wrap text-body leading-relaxed text-ink">
                  {report.post_body}
                </p>
              </div>
              {report.report_details && (
                <p className="mt-4 rounded-[var(--radius-control)] border border-line px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  <strong className="font-medium text-ink">Detalle del reporte:</strong>{" "}
                  {report.report_details}
                </p>
              )}
              <div className="mt-5 space-y-2">
                <Label htmlFor={`moderation-note-${report.report_id}`}>
                  Nota interna (opcional)
                </Label>
                <Textarea
                  id={`moderation-note-${report.report_id}`}
                  value={noteByReport[report.report_id] ?? ""}
                  onChange={(event) =>
                    setNoteByReport((current) => ({
                      ...current,
                      [report.report_id]: event.target.value,
                    }))
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Qué se revisó y por qué…"
                  disabled={busy}
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" onClick={() => void resolve(report, "hide")} disabled={busy}>
                  {busy ? "Guardando…" : "Ocultar publicación"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void resolve(report, "dismiss")}
                  disabled={busy}
                >
                  Descartar reporte
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <Link
        to={routes.community}
        className="inline-flex text-body font-medium text-brand underline underline-offset-4"
      >
        Ver el muro comunitario
      </Link>
    </div>
  );
}
