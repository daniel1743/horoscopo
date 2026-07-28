import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { AssistantChat } from "@/components/ai/AssistantChat";

export function AssistantPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Asistente", href: routes.assistant },
      ]}
    >
      <PageHeader
        eyebrow="Asistente"
        title="Guía Astral — un acompañamiento para reflexionar"
        description="Conversa sobre tus lecturas, horóscopos o guías. Las respuestas son orientativas y siempre se apoyan en contenido publicado."
      />
      <div className="mt-4">
        <AssistantChat mode="general" />
      </div>
    </PageShell>
  );
}
