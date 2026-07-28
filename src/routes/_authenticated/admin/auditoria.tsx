import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAuditLog } from "@/lib/admin/articles.functions";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoría — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const listFn = useServerFn(adminListAuditLog);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "audit", "latest"],
    queryFn: () => listFn({ data: { limit: 100 } }),
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-h2 text-ink">Auditoría</h1>
        <p className="text-caption text-ink-soft">
          Registro append-only de las últimas 100 acciones administrativas.
          Sólo visible para admin y super_admin.
        </p>
      </header>

      {isLoading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : error ? (
        <p className="text-red-600">{(error as Error).message}</p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-warm-white">
          <table className="w-full text-sm">
            <thead className="bg-brand-soft/40 text-left text-caption uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Recurso</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Actor</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((e: any) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="p-3 text-ink-soft">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-xs">{e.action}</td>
                  <td className="p-3 text-ink-soft">
                    {e.resource_type ?? "—"}
                    {e.resource_id ? ` · ${e.resource_id.slice(0, 8)}…` : ""}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={e.status === "success" ? "blue" : "rose"}
                    >
                      {e.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-caption text-ink-soft">
                    {e.actor_role ?? "—"}
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-ink-soft">
                    Sin eventos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
