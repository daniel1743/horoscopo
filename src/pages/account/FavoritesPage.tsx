import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { listFavorites, removeFavorite } from "@/lib/account/repository";
import { toast } from "sonner";

export function FavoritesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["favorites"], queryFn: listFavorites });

  const remove = async (itemType: string, itemRef: string) => {
    try {
      await removeFavorite(itemType as never, itemRef);
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Favorito eliminado");
    } catch {
      toast.error("No pudimos eliminar el favorito");
    }
  };

  return (
    <AccountShell title="Favoritos" description="Contenidos que guardaste para volver más tarde.">
      {isLoading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-ink-soft">
          Aún no tienes favoritos. Toca el ícono <Icon name="favorite" size="sm" className="inline" /> en cualquier contenido para guardarlo aquí.
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((fav) => (
            <li
              key={fav.id}
              className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-warm-white p-4"
            >
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-muted">{fav.item_type}</div>
                <div className="mt-0.5 font-medium text-ink">{fav.item_title ?? fav.item_ref}</div>
                <div className="mt-1 text-xs text-ink-muted">
                  Guardado el {new Date(fav.created_at).toLocaleDateString()}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(fav.item_type, fav.item_ref)}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
