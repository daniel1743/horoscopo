import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_ROLE_META, type AdminRole } from "@/lib/admin/roles";
import { Route as AdminRoute } from "./route";

/**
 * Dashboard administrativo vacío (Fase A).
 * No muestra métricas falsas. Las tarjetas de módulos se completan en fases posteriores.
 */
export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Panel administrativo — Creovision" },
      { name: "description", content: "Área privada de gestión editorial y administrativa." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { adminIdentity } = AdminRoute.useRouteContext();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-h2 text-ink">Bienvenido/a al panel</h1>
        <p className="text-body text-ink-soft">
          Este es el punto de entrada del sistema administrativo. Las funciones
          editoriales, workflow, revisiones, medios y publicación programada se
          habilitan en fases posteriores.
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
        aria-label="Estado del sistema"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
      >
        <h2 className="text-h4 text-ink">Próximas fases</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Fase B: CRUD editorial de artículos con revisiones y concurrencia optimista.</li>
          <li>Fase C: Workflow completo + publicación programada + sync buscador.</li>
          <li>Fase D: Biblioteca de medios con Supabase Storage.</li>
          <li>Fase E: Módulos restantes (tarot, horóscopos, luna, compatibilidad).</li>
        </ul>
      </section>
    </div>
  );
}
