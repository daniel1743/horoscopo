import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes, zodiacRoute } from "@/config/routes";
import { getAuraStyle } from "@/config/profile";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import type { PublicProfile } from "@/lib/account/repository";

interface Props {
  profile: PublicProfile | null;
}

export function PublicProfilePage({ profile }: Props) {
  if (!profile) {
    return (
      <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Perfil" }]}>
        <PageHeader
          eyebrow="Perfil público"
          title="Perfil no disponible"
          description="Puede que este perfil sea privado o que el enlace ya no exista."
        />
        <Link
          to={routes.home}
          className="font-body text-[14px] font-medium text-brand underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </PageShell>
    );
  }

  const aura = getAuraStyle(profile.aura_style);
  const sign = profile.preferred_sign ? getZodiacBySlug(profile.preferred_sign) : null;
  const displayName = profile.display_name?.trim() || profile.username;

  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Perfil público" }]}>
      <section className="overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-warm-white shadow-card">
        <div className={`relative h-36 bg-gradient-to-r ${aura.className} md:h-48`}>
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 78% 26%, white 0 1px, transparent 2px), radial-gradient(circle at 62% 64%, white 0 1px, transparent 2px), radial-gradient(circle at 36% 28%, white 0 1px, transparent 2px)",
              backgroundSize: "72px 58px, 96px 74px, 110px 86px",
            }}
          />
        </div>
        <div className="relative px-5 pb-6 md:px-8 md:pb-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-warm-white bg-night text-3xl font-semibold text-ink-inverse shadow-card sm:h-32 sm:w-32">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${displayName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-[28px] font-semibold text-ink md:text-[36px]">
                  {displayName}
                </h1>
                <p className="font-body text-[13px] text-ink-muted">@{profile.username}</p>
              </div>
            </div>
            {sign && (
              <Link
                to={zodiacRoute(sign.slug)}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-2 font-body text-[13px] font-medium text-ink-soft hover:border-brand/40 hover:text-brand"
              >
                <span aria-hidden>{sign.symbol}</span> {sign.name}
              </Link>
            )}
          </div>

          <div className="mt-6 max-w-[68ch]">
            {profile.bio ? (
              <p className="font-body text-[16px] leading-[1.7] text-ink">{profile.bio}</p>
            ) : (
              <p className="font-body text-[15px] text-ink-soft">
                Este perfil todavía está encontrando sus palabras.
              </p>
            )}
            <p className="mt-3 font-body text-[12px] uppercase tracking-[0.12em] text-brand">
              Aura · {aura.label}
            </p>
            {profile.city && (
              <p className="mt-1 font-body text-[13px] text-ink-muted">{profile.city}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="public-wall-title">
        <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
              Espacio público
            </p>
            <h2
              id="public-wall-title"
              className="mt-1 font-display text-[24px] font-semibold text-ink"
            >
              Muro de {displayName}
            </h2>
          </div>
          <span className="font-body text-[12px] text-ink-muted">
            Las publicaciones se comparten voluntariamente
          </span>
        </div>
        <div className="mt-6 rounded-[var(--radius-card-lg)] border border-dashed border-line bg-ivory/60 p-8 text-center">
          <p className="font-display text-[20px] font-semibold text-ink">
            Aquí aparecerán sus publicaciones
          </p>
          <p className="mx-auto mt-2 max-w-[48ch] font-body text-[14px] leading-[1.6] text-ink-soft">
            Cuando el muro esté activo, esta persona podrá compartir lecturas, reflexiones y
            momentos de su recorrido esotérico.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
