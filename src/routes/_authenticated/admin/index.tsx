import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_ROLE_META, type AdminRole } from "@/lib/admin/roles";
import { fetchAdminProductMetrics } from "@/lib/account/repository";
import { Route as AdminRoute } from "./route";

/**
 * Dashboard administrativo con señales agregadas de producto.
 * Las métricas se muestran únicamente cuando el RPC protegido está disponible.
 */
export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Panel administrativo — Proyecto Astral" },
      { name: "description", content: "Área privada de gestión editorial y administrativa." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

const metricDefinitions = [
  { key: "registered_profiles", label: "Perfiles registrados" },
  { key: "public_profiles", label: "Perfiles públicos" },
  { key: "active_users_30d", label: "Usuarios activos · 30 días" },
  { key: "reading_views_30d", label: "Lecturas · 30 días" },
  { key: "community_posts_30d", label: "Publicaciones · 30 días" },
  { key: "open_reports", label: "Reportes abiertos" },
] as const;

function AdminDashboard() {
  const { adminIdentity } = AdminRoute.useRouteContext();
  const metricsQuery = useQuery({
    queryKey: ["admin", "product-metrics"],
    queryFn: fetchAdminProductMetrics,
    staleTime: 1000 * 60 * 5,
  });
  const metrics = new Map(
    (metricsQuery.data ?? []).map((metric) => [metric.metric_key, metric.metric_value]),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-h2 text-ink">Bienvenido/a al panel</h1>
        <p className="text-body text-ink-soft">
          Este es el punto de entrada del sistema administrativo. Las funciones editoriales,
          workflow, revisiones, medios y publicación programada se habilitan en fases posteriores.
        </p>
      </header>

      <section
        aria-label="Roles activos"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
      >
        <h2 className="text-h4 text-ink">Tus roles</h2>
        <ul className="mt-3 space-y-3">
          {adminIdentity.roles.map((role: AdminRole) => {
            const meta = ADMIN_ROLE_META[role];
            return (
              <li key={role} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">{meta.label}</span>
                <span className="text-caption text-ink-soft">{meta.description}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="product-metrics-title"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-caption uppercase tracking-wide text-brand">Señales agregadas</p>
            <h2 id="product-metrics-title" className="mt-1 text-h4 text-ink">
              Estado del producto
            </h2>
          </div>
          <p className="text-caption text-ink-muted">Ventana de actividad: 30 días</p>
        </div>
        {metricsQuery.isLoading && <p className="mt-4 text-sm text-ink-soft">Cargando métricas…</p>}
        {metricsQuery.isError && (
          <p className="mt-4 rounded-[var(--radius-control)] bg-ivory px-3 py-2 text-sm text-ink-soft">
            Las métricas todavía no están disponibles. Comprueba que el RPC de producto esté
            aplicado.
          </p>
        )}
        {!metricsQuery.isLoading && !metricsQuery.isError && (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metricDefinitions.map((metric) => (
              <div key={metric.key} className="rounded-[var(--radius-control)] bg-ivory/70 p-4">
                <dt className="text-caption text-ink-soft">{metric.label}</dt>
                <dd className="mt-1 text-h3 text-ink">
                  {(metrics.get(metric.key) ?? 0).toLocaleString("es-ES")}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 text-caption leading-relaxed text-ink-muted">
          Son totales agregados para orientar decisiones de producto. No muestran perfiles,
          preguntas ni publicaciones individuales.
        </p>
      </section>

      <section
        aria-label="Siguientes tareas operativas"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
      >
        <h2 className="text-h4 text-ink">Siguientes tareas operativas</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Aplicar y verificar las migraciones sociales en el entorno de producción.</li>
          <li>Revisar reportes abiertos antes de ampliar la audiencia del muro.</li>
          <li>
            Observar activación, lecturas y publicaciones antes de tomar decisiones de crecimiento.
          </li>
        </ul>
      </section>
    </div>
  );
}
