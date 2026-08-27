import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotCardVisual } from "@/components/tarot/TarotCardVisual";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { tarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import { yesNoLabels } from "@/config/tarot";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { TarotRelatedCards } from "@/components/tarot/TarotRelatedCards";

interface Props {
  slug: string;
}

export function TarotCardDetailPage({ slug }: Props) {
  const q = useQuery({
    queryKey: tarotQueryKeys.card(slug),
    queryFn: () => tarotService.getCardBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });

  if (q.isLoading)
    return (
      <PageShell>
        <TarotSkeleton label="Cargando carta" />
      </PageShell>
    );
  if (q.isError || !q.data) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Inicio", href: routes.home },
          { label: "Tarot", href: routes.tarot },
          { label: "Biblioteca", href: routes.tarotLibrary },
        ]}
      >
        <PageHeader eyebrow="Tarot" title="Carta no encontrada" />
        <p className="font-body text-[15px] text-ink-soft">
          Puede que aún no esté publicada. Vuelve a la{" "}
          <Link to={routes.tarotLibrary} className="text-cosmic hover:underline">
            biblioteca
          </Link>
          .
        </p>
      </PageShell>
    );
  }

  const card = q.data;
  const yesNo = yesNoLabels[card.yesNoTendency];

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Biblioteca", href: routes.tarotLibrary },
        { label: card.name },
      ]}
    >
      <PageHeader
        eyebrow={
          card.arcana === "major" ? "Arcano mayor" : `Arcano menor · ${card.suit ?? "Tarot"}`
        }
        title={card.name}
        description="Una ficha para comprender el símbolo, llevarlo a tu contexto y observar qué pregunta despierta en ti."
      />
      <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_1fr]">
        <div className="mx-auto md:mx-0">
          <TarotCardVisual card={card} revealed size="lg" />
        </div>
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="font-display text-[20px] font-semibold text-ink">
              Qué representa esta carta
            </h2>
            <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink-soft">{card.summary}</p>
          </section>
          <section>
            <h2 className="font-display text-[20px] font-semibold text-ink">
              Significado al derecho
            </h2>
            <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink">
              {card.uprightMeaning}
            </p>
          </section>
          <section className="rounded-[var(--radius-card-md)] border border-cosmic/20 bg-cosmic/5 p-5">
            <h2 className="font-display text-[20px] font-semibold text-ink">
              Significado invertido
            </h2>
            <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink-soft">
              {card.reversedMeaning ??
                "Esta carta todavía no tiene una lectura invertida publicada."}
            </p>
            <p className="mt-3 font-body text-[12px] leading-[1.5] text-ink-muted">
              Una carta invertida no es “mala”: señala una energía bloqueada, internalizada o que
              pide otra forma de atención.
            </p>
          </section>
          {card.keywords.length > 0 && (
            <section>
              <h2 className="font-display text-[18px] text-ink">Palabras clave</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {card.keywords.map((k) => (
                  <li
                    key={k}
                    className="rounded-full border border-line-soft px-3 py-1 font-body text-[12px] text-ink-soft"
                  >
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="font-display text-[18px] text-ink">Tendencia en preguntas sí/no</h2>
            <p className="mt-2 font-body text-[15px] leading-[1.6] text-ink-soft">
              <strong className="text-ink">{yesNo.display}.</strong> {yesNo.description}
            </p>
          </section>
          {card.reflectionQuestion && (
            <section className="rounded-[var(--radius-card)] border border-cosmic/20 bg-cosmic/5 p-5">
              <h2 className="font-display text-[18px] font-semibold text-ink">
                Pregunta para reflexionar
              </h2>
              <p className="mt-2 font-body text-[13px] leading-[1.6] text-ink-soft">
                No es una pregunta que debas responderle al sistema. Es una invitación a observar tu
                propia situación.
              </p>
              <p className="mt-3 border-l-2 border-cosmic/40 pl-3 font-display text-[16px] italic text-ink">
                {card.reflectionQuestion}
              </p>
            </section>
          )}
          <div className="flex flex-wrap gap-3">
            <FavoriteButton
              itemType="tarot_card"
              itemRef={card.slug}
              itemTitle={card.name}
              metadata={{ cardKey: card.cardKey }}
            />
            <Link
              to={routes.tarotDaily}
              className="inline-flex items-center rounded-[var(--radius-control)] border border-line px-4 py-2 font-body text-[13px] font-medium text-cosmic hover:bg-cosmic/5"
            >
              Sacar una carta
            </Link>
          </div>
        </div>
      </div>
      <TarotRelatedCards card={card} />
      <TarotReadingDisclaimer />
    </PageShell>
  );
}
