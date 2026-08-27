import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { communityPostTypeLabels, communityReportReasons } from "@/config/community";
import {
  listOpenCommunityCommentReports,
  listOpenCommunityReports,
  moderateCommunityCommentReport,
  moderateCommunityReport,
  type CommunityCommentModerationReport,
  type CommunityModerationReport,
} from "@/lib/account/repository";
import { emptyCommunitySearch, routes } from "@/config/routes";
import { toast } from "sonner";

type ModerationItem =
  | (CommunityModerationReport & { kind: "post" })
  | (CommunityCommentModerationReport & { kind: "comment" });

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const reasonLabel = (
  reason:
    CommunityModerationReport["report_reason"] | CommunityCommentModerationReport["report_reason"],
) => communityReportReasons.find((item) => item.value === reason)?.label ?? reason;

export function CommunityModerationPage() {
  const queryClient = useQueryClient();
  const [noteByReport, setNoteByReport] = useState<Record<string, string>>({});
  const [busyReport, setBusyReport] = useState<string | null>(null);
  const postsQuery = useQuery({
    queryKey: ["admin", "community-reports"],
    queryFn: () => listOpenCommunityReports(50),
    staleTime: 1000 * 30,
  });
  const commentsQuery = useQuery({
    queryKey: ["admin", "community-comment-reports"],
    queryFn: () => listOpenCommunityCommentReports(50),
    staleTime: 1000 * 30,
  });

  const query = postsQuery;
  const reports: ModerationItem[] = [
    ...(postsQuery.data ?? []).map((report) => ({ ...report, kind: "post" as const })),
    ...(commentsQuery.data ?? []).map((report) => ({ ...report, kind: "comment" as const })),
  ].sort(
    (left, right) => new Date(left.reported_at).getTime() - new Date(right.reported_at).getTime(),
  );

  const resolve = async (report: ModerationItem, decision: "dismiss" | "hide") => {
    const target = report.kind === "comment" ? "este comentario" : "esta publicación";
    if (decision === "hide" && !window.confirm(`¿Ocultar ${target} del muro?`)) return;
    setBusyReport(report.report_id);
    try {
      const changed =
        report.kind === "comment"
          ? await moderateCommunityCommentReport({
              reportId: report.report_id,
              decision,
              note: noteByReport[report.report_id] ?? null,
            })
          : await moderateCommunityReport({
              reportId: report.report_id,
              decision,
              note: noteByReport[report.report_id] ?? null,
            });
      if (!changed) {
        toast("Este reporte ya había sido resuelto por otra persona.");
      } else {
        toast.success(decision === "hide" ? `${target} ocultado del muro.` : "Reporte descartado.");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "community-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "community-comment-reports"] }),
      ]);
    } catch {
      toast.error("No pudimos actualizar el reporte. Comprueba tus permisos y migraciones.");
    } finally {
      setBusyReport(null);
    }
  };

  const isLoading = postsQuery.isLoading || commentsQuery.isLoading;
  const isError = query.isError || commentsQuery.isError;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-caption uppercase tracking-wide text-brand">Seguridad comunitaria</p>
        <h1 className="text-h2 text-ink">Reportes del muro</h1>
        <p className="max-w-[68ch] text-body text-ink-soft">
          Revisa publicaciones y comentarios, aplica una decisión proporcional y deja una nota
          interna cuando ayude a la siguiente revisión. Esta bandeja solo debe estar disponible para
          roles autorizados.
        </p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft/30 p-4 text-sm leading-relaxed text-ink-soft">
        Ocultar un contenido lo retira del feed público sin eliminarlo. El reporte y la decisión
        quedan registrados en la auditoría administrativa.
      </div>

      {isLoading && <p className="text-body text-ink-soft">Cargando reportes abiertos…</p>}
      {isError && (
        <div className="rounded-[var(--radius-card)] border border-line bg-warm-white p-6">
          <h2 className="text-h4 text-ink">No se pudo cargar la bandeja</h2>
          <p className="mt-2 text-body text-ink-soft">
            Comprueba que los lotes 05, 07 y 08 de Comunidad estén aplicados y que tu cuenta tenga
            rol de admin o editor.
          </p>
        </div>
      )}
      {!isLoading && !isError && reports.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-8 text-center">
          <h2 className="text-h4 text-ink">No hay reportes abiertos</h2>
          <p className="mt-2 text-body text-ink-soft">La bandeja está al día.</p>
        </div>
      )}

      <div className="space-y-4">
        {reports.map((report) => {
          const busy = busyReport === report.report_id;
          const isComment = report.kind === "comment";
          return (
            <article
              key={`${report.kind}-${report.report_id}`}
              className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-caption uppercase tracking-wide text-error">
                    Reporte abierto · {isComment ? "Comentario" : "Publicación"}
                  </p>
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
                {isComment ? (
                  <>
                    <p className="mt-3 text-caption uppercase tracking-wide text-ink-muted">
                      Comentario reportado
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-body leading-relaxed text-ink">
                      {report.comment_body}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-body leading-relaxed text-ink">
                    {report.post_body}
                  </p>
                )}
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
                  {busy ? "Guardando…" : isComment ? "Ocultar comentario" : "Ocultar publicación"}
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
        search={emptyCommunitySearch}
        className="inline-flex text-body font-medium text-brand underline underline-offset-4"
      >
        Ver el muro comunitario
      </Link>
    </div>
  );
}
