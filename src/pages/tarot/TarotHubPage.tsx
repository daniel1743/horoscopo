import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export function TarotHubPage() {
  const { user } = useSession();

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
      ]}
    >
      {/* Hero Section */}
      <section className="mb-12 text-center md:text-left">
        <div className="mb-2 text-sm font-semibold tracking-wider text-cosmic uppercase">Tarot</div>
        <h1 className="mb-4 font-display text-[32px] leading-tight text-ink md:text-[40px]">
          ¿Qué quieres explorar hoy?
        </h1>
        <p className="font-body text-[16px] leading-[1.6] text-ink-soft md:text-[18px] max-w-2xl">
          Utiliza las cartas como una herramienta de reflexión. No sustituyen decisiones
          profesionales ni consejos personales.
        </p>
      </section>

      {/* Producto Principal: Tres Cartas */}
      <section className="mb-8">
        <div className="group relative overflow-hidden rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 transition-colors md:p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic/10 text-cosmic">
                  <Icon name="tarot" className="h-5 w-5" />
                </span>
                <h2 className="font-display text-[24px] text-ink">Tirada de Tres Cartas</h2>
              </div>
              <p className="font-body text-[15px] leading-[1.6] text-ink-soft mb-6">
                Profundiza en una situación a través de tres posiciones. Observa qué influye, qué
                necesita atención y cuál podría ser tu próximo paso.
              </p>

              <Link
                to={routes.tarotThreeCards}
                className="inline-flex items-center justify-center rounded-full bg-cosmic px-6 py-3 font-display text-[15px] text-warm-white transition-colors hover:bg-cosmic-dark"
              >
                Elegir mis tres cartas
              </Link>

              <div className="mt-8 border-t border-line-soft pt-6">
                <h3 className="mb-4 font-display text-[16px] text-ink-muted">
                  Variantes temáticas:
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/tarot/tres-cartas/amor"
                    className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-warm-white px-4 py-2 font-body text-[14px] text-ink transition-colors hover:border-cosmic hover:text-cosmic"
                  >
                    <Icon name="heart" className="h-4 w-4" /> Amor
                  </Link>
                  <Link
                    to="/tarot/tres-cartas/trabajo"
                    className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-warm-white px-4 py-2 font-body text-[14px] text-ink transition-colors hover:border-cosmic hover:text-cosmic"
                  >
                    Trabajo
                  </Link>
                  <Link
                    to="/tarot/tres-cartas/decision"
                    className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-warm-white px-4 py-2 font-body text-[14px] text-ink transition-colors hover:border-cosmic hover:text-cosmic"
                  >
                    Decisiones
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Hint */}
            <div className="hidden shrink-0 grid-cols-3 gap-2 opacity-80 md:grid">
              <div className="aspect-[7/12] w-20 rounded-md border border-gold/40 bg-night-elevated shadow-elevated">
                <img
                  src="/carta trasera.png"
                  alt=""
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
              <div className="aspect-[7/12] w-20 translate-y-4 rounded-md border border-gold/40 bg-night-elevated shadow-elevated">
                <img
                  src="/carta trasera.png"
                  alt=""
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
              <div className="aspect-[7/12] w-20 rounded-md border border-gold/40 bg-night-elevated shadow-elevated">
                <img
                  src="/carta trasera.png"
                  alt=""
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <Link
          to={routes.tarotDaily}
          className="group flex flex-col justify-between rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 transition-colors hover:border-cosmic/50"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic/10 text-cosmic">
                <Icon name="sun" className="h-5 w-5" />
              </span>
              <h2 className="font-display text-[20px] text-ink">Carta del día</h2>
            </div>
            <p className="font-body text-[14px] leading-[1.6] text-ink-soft">
              Una carta y un foco para hoy. Orientación diaria con baja fricción.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-body text-[14px] font-medium text-cosmic">
            Sacar mi carta de hoy
            <Icon name="chevronRight" className="h-4 w-4" />
          </span>
        </Link>

        <Link
          to={routes.tarotYesNo}
          className="group flex flex-col justify-between rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 transition-colors hover:border-cosmic/50"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic/10 text-cosmic">
                <Icon name="premium" className="h-5 w-5" />
              </span>
              <h2 className="font-display text-[20px] text-ink">Sí o no</h2>
            </div>
            <p className="font-body text-[14px] leading-[1.6] text-ink-soft">
              Haz una pregunta concreta y recibe una orientación directa.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-body text-[14px] font-medium text-cosmic">
            Hacer mi pregunta
            <Icon name="chevronRight" className="h-4 w-4" />
          </span>
        </Link>
      </section>

      {/* Exploración y Continuidad */}
      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <Link
          to={routes.tarotLibrary}
          className="group flex items-center justify-between rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-6 transition-colors hover:bg-parchment-elevated"
        >
          <div>
            <h2 className="font-display text-[18px] text-ink">Biblioteca</h2>
            <p className="mt-1 font-body text-[14px] text-ink-soft">
              Conoce las 78 cartas y sus significados.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 font-body text-[14px] font-medium text-cosmic group-hover:underline">
            Explorar las 78 cartas
            <Icon name="chevronRight" className="h-4 w-4" />
          </span>
        </Link>

        {user && (
          <Link
            to="/mi-espacio/lecturas"
            className="group flex items-center justify-between rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-6 transition-colors hover:bg-parchment-elevated"
          >
            <div>
              <h2 className="font-display text-[18px] text-ink">Mis Lecturas</h2>
              <p className="mt-1 font-body text-[14px] text-ink-soft">
                Revisa las tiradas que has guardado.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 font-body text-[14px] font-medium text-cosmic group-hover:underline">
              Volver a mis lecturas
              <Icon name="chevronRight" className="h-4 w-4" />
            </span>
          </Link>
        )}
      </section>

      <TarotReadingDisclaimer />
    </PageShell>
  );
}
