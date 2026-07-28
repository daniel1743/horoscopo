import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { iconRegistry, type IconName } from "@/config/icons";
import { typography } from "@/design-system/typography";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Sistema de diseño — Proyecto Astral" },
      { name: "description", content: "Referencia visual interna de tokens y primitivas." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DesignSystemPage,
});

const swatches: { label: string; value: string; className: string; note?: string }[] = [
  { label: "Cosmic Violet", value: "#6C4BD9", className: "bg-brand" },
  { label: "Violet Hover", value: "#5737BE", className: "bg-brand-hover" },
  { label: "Violet Soft", value: "#F0EBFA", className: "bg-brand-soft" },
  { label: "Lunar Ivory", value: "#F8F5F0", className: "bg-ivory" },
  { label: "Warm White", value: "#FFFFFF", className: "bg-warm-white border border-line" },
  { label: "Deep Night", value: "#171526", className: "bg-night" },
  { label: "Deep Night Elevated", value: "#211E34", className: "bg-night-elevated" },
  { label: "Lunar Gold", value: "#C5A467", className: "bg-gold" },
  { label: "Astral Rose", value: "#B96F91", className: "bg-rose" },
  { label: "Celestial Blue", value: "#7189C8", className: "bg-celestial" },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-14">
      <h3 className="font-display text-[23px] font-semibold mb-5">{title}</h3>
      <div className="bg-warm-white border border-line-subtle rounded-[var(--radius-card)] p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

function DesignSystemPage() {
  const iconNames = Object.keys(iconRegistry) as IconName[];
  return (
    <div className="bg-ivory min-h-screen">
      <Container className="py-14 md:py-20">
        <header className="mb-12">
          <Badge variant="premium">Interno</Badge>
          <h1 className="mt-4 font-display text-[42px] md:text-[56px] leading-[1.05] tracking-[-0.03em] font-semibold">
            Sistema de diseño
          </h1>
          <p className="mt-3 max-w-[62ch] font-body text-[18px] text-ink-soft">
            Fuente única de tokens, primitivas y variantes para Proyecto Astral. Nada de lo que ves
            aquí debe reescribirse en las páginas.
          </p>
        </header>

        <Block title="Colores">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {swatches.map((s) => (
              <li key={s.label}>
                <div className={`${s.className} h-20 rounded-[var(--radius-image)]`} />
                <p className="mt-2 font-body text-[14px] font-semibold">{s.label}</p>
                <p className="font-body text-[12px] text-ink-muted">{s.value}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Tipografía">
          <div className="space-y-4">
            <p className={typography.displayXl}>Display XL — Fraunces</p>
            <p className={typography.h1}>Encabezado H1</p>
            <p className={typography.h2}>Encabezado H2</p>
            <p className={typography.h3}>Encabezado H3</p>
            <p className={typography.h4}>Encabezado H4</p>
            <p className={typography.bodyLg}>
              Cuerpo largo (Manrope) — la lectura editorial debe respirar en líneas cortas y con
              jerarquía clara.
            </p>
            <p className={typography.bodyMd}>Cuerpo medio para interfaz.</p>
            <p className={typography.bodySm}>Cuerpo pequeño para metadatos.</p>
            <p className={typography.label}>Label del formulario</p>
            <p className={typography.caption}>Caption / eyebrow</p>
          </div>
        </Block>

        <Block title="Botones">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Acción principal</Button>
            <Button variant="secondary">Secundaria</Button>
            <Button variant="dark">Oscura</Button>
            <Button variant="premium">
              <Icon name="premium" /> Premium
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Deshabilitado
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Buscar">
              <Icon name="search" />
            </Button>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="violet">Violeta</Badge>
            <Badge variant="premium">Premium</Badge>
            <Badge variant="rose">Amor</Badge>
            <Badge variant="blue">Luna</Badge>
          </div>
        </Block>

        <Block title="Inputs">
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="block font-body text-[14px] font-semibold mb-2">Correo</label>
              <Input type="email" placeholder="tu@correo.com" />
            </div>
            <div>
              <label className="block font-body text-[14px] font-semibold mb-2">Con error</label>
              <Input aria-invalid defaultValue="valor inválido" />
              <p className="mt-1 font-body text-[13px] text-danger">
                Este campo requiere un valor válido.
              </p>
            </div>
          </div>
        </Block>

        <Block title="Tarjetas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="bg-warm-white border border-line-subtle rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
              <h4 className="font-display text-[19px] font-semibold">Default</h4>
              <p className="mt-2 font-body text-[14px] text-ink-soft">
                Superficie estándar con sombra suave.
              </p>
            </article>
            <article className="bg-warm-white border border-line rounded-[var(--radius-card-lg)] p-6">
              <h4 className="font-display text-[19px] font-semibold">Editorial</h4>
              <p className="mt-2 font-body text-[14px] text-ink-soft">
                Sin sombra, para lectura larga.
              </p>
            </article>
            <article className="bg-night-elevated border border-line-dark text-ink-inverse rounded-[var(--radius-card-lg)] p-6">
              <h4 className="font-display text-[19px] font-semibold">Dark</h4>
              <p className="mt-2 font-body text-[14px] text-ink-inverse-soft">
                Superficie oscura para secciones inmersivas.
              </p>
            </article>
          </div>
        </Block>

        <Block title="Iconos">
          <ul className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {iconNames.map((n) => (
              <li key={n} className="flex flex-col items-center gap-2">
                <Icon name={n} size="lg" className="text-brand" />
                <span className="font-body text-[12px] text-ink-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Espaciado">
          <div className="space-y-2">
            {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <span className="font-body text-[13px] text-ink-muted w-14">{n}px</span>
                <div className="bg-brand-soft h-4" style={{ width: n * 4 }} />
              </div>
            ))}
          </div>
        </Block>

        <SectionHeading
          eyebrow="Fin"
          title="Todo componente nuevo debe partir de estas piezas."
          description="Si un patrón se repite en dos páginas, promuévelo aquí antes de duplicarlo."
        />
      </Container>
    </div>
  );
}
