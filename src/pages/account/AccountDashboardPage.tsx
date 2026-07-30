import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { routes } from "@/config/routes";
import { accountNav } from "@/config/mi-espacio";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { fetchProfile, listFavorites, listSavedReadings } from "@/lib/account/repository";
import { isAstralProfileComplete } from "@/lib/account/auth-profile";

/** Resumen de Mi espacio: saludo + accesos rápidos + contadores. */
export function AccountDashboardPage() {
  const { user } = useSession();
  const userId = user?.id;

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  const favorites = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => listFavorites(),
    enabled: !!userId,
  });
  const readings = useQuery({
    queryKey: ["saved-readings", userId],
    queryFn: () => listSavedReadings(),
    enabled: !!userId,
  });

  const greeting = profile.data?.display_name || user?.email?.split("@")[0] || "explorador";
  const profileComplete = isAstralProfileComplete(profile.data);

  return (
    <AccountShell title={`Hola, ${greeting}`} description="Tu espacio personal en Creovision.">
      {!profile.isLoading && !profileComplete && (
        <section className="mb-6 rounded-[var(--radius-card)] border border-line bg-warm-white p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Completa tu perfil astral
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Estos datos permiten calcular tu carta y ofrecer resultados adaptados a tu
                nacimiento.
              </p>
            </div>
            <Button asChild>
              <Link to={routes.profile}>Completar perfil</Link>
            </Button>
          </div>
        </section>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Favoritos"
          value={favorites.data?.length ?? 0}
          to={routes.favorites}
          icon="favorite"
        />
        <StatCard
          label="Lecturas guardadas"
          value={readings.data?.length ?? 0}
          to={routes.savedReadings}
          icon="tarot"
        />
        <StatCard
          label="Perfil astral"
          value={profileComplete ? "Completo" : "Pendiente"}
          to={routes.profile}
          icon="sun"
        />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">Todas las secciones</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accountNav
          .filter((n) => n.routeKey !== "account")
          .map((item) => (
            <Link
              key={item.routeKey}
              to={routes[item.routeKey]}
              className={`group rounded-[var(--radius-card)] border border-line bg-warm-white p-4 transition-colors hover:bg-brand-soft/60 ${
                item.disabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon name={item.icon} size="sm" />
                </span>
                <div>
                  <div className="font-medium text-ink">
                    {item.label}
                    {item.disabled && (
                      <span className="ml-2 text-xs text-ink-muted">(no disponible)</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </AccountShell>
  );
}

function StatCard({
  label,
  value,
  to,
  icon,
}: {
  label: string;
  value: string | number;
  to: string;
  icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-card">
        <CardContent className="flex items-center gap-4 p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon name={icon} size="md" />
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
            <div className="font-display text-2xl font-semibold text-ink">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
