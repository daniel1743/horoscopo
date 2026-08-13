import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  listMemoriesFn,
  updateMemoryFn,
  deleteMemoryFn,
  deleteAllMemoriesFn,
} from "@/lib/ai/account.functions";
import { memoryCategoryLabels, memoryNeverStore } from "@/config/ai/memory";
import { assistantDisclaimers } from "@/config/ai/assistant";
import { useSession } from "@/hooks/useSession";

export function MemoryPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const list = useServerFn(listMemoriesFn);
  const update = useServerFn(updateMemoryFn);
  const del = useServerFn(deleteMemoryFn);
  const delAll = useServerFn(deleteAllMemoriesFn);

  const memoriesQuery = useQuery({ queryKey: ["ai-memories", user?.id ?? "anon"], queryFn: () => list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ai-memories", user?.id ?? "anon"] });

  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => update({ data: v }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: invalidate,
  });
  const removeAll = useMutation({ mutationFn: () => delAll(), onSuccess: invalidate });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Mi espacio", href: routes.account },
        { label: "Memoria", href: routes.accountMemory },
      ]}
    >
      <PageHeader
        eyebrow="Mi espacio"
        title="Memoria del asistente"
        description={assistantDisclaimers.memory}
      />

      <section className="mt-6 flex flex-col gap-4">
        {memoriesQuery.isLoading && (
          <p className="font-body text-[14px] text-ink-soft">Cargando tus recuerdos…</p>
        )}
        {memoriesQuery.isError && (
          <p role="alert" className="font-body text-[14px] text-error">
            No se pudieron cargar los recuerdos. Inicia sesión para verlos.
          </p>
        )}
        {memoriesQuery.data && memoriesQuery.data.length === 0 && (
          <div className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6">
            <p className="font-body text-[15px] text-ink">
              Aún no guardas ningún recuerdo. Solo se guardan cuando confirmas explícitamente.
            </p>
          </div>
        )}
        <ul className="grid gap-3 md:grid-cols-2">
          {memoriesQuery.data?.map((m) => (
            <li
              key={m.id}
              className="rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-4"
            >
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.12em] text-cosmic">
                {memoryCategoryLabels[m.category as keyof typeof memoryCategoryLabels]}
              </p>
              <p className="mt-1 font-body text-[15px] text-ink">{m.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggle.mutate({ id: m.id, active: !m.active })}
                >
                  {m.active ? "Pausar" : "Reactivar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => remove.mutate(m.id)}>
                  <Icon name="close" /> Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {memoriesQuery.data && memoriesQuery.data.length > 0 && (
          <div>
            <Button type="button" variant="outline" onClick={() => removeAll.mutate()}>
              Eliminar todos los recuerdos
            </Button>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6">
        <h2 className="font-display text-[20px] text-ink">Qué nunca guardamos</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {memoryNeverStore.map((n) => (
            <li key={n} className="font-body text-[14px] text-ink-soft">
              — {n}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
