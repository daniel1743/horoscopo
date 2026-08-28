import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { addFavorite, removeFavorite, type FavoriteType } from "@/lib/account/repository";
import { toast } from "sonner";

interface Props {
  itemType: FavoriteType;
  itemRef: string;
  itemTitle?: string;
  metadata?: Record<string, unknown>;
  variant?: "default" | "ghost" | "outline";
}

/** Botón "Guardar en favoritos". Muestra CTA de login si no hay sesión. */
export function FavoriteButton({
  itemType,
  itemRef,
  itemTitle,
  metadata,
  variant = "outline",
}: Props) {
  const { user, loading } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    supabase
      .from("user_favorites")
      .select("id")
      .eq("item_type", itemType)
      .eq("item_ref", itemRef)
      .maybeSingle()
      .then(({ data }) => setSaved(Boolean(data)));
  }, [user, itemType, itemRef]);

  if (loading) return null;

  if (!user) {
    return (
      <Button asChild variant={variant} size="sm">
        <Link
          to={routes.signIn}
          search={{ redirect: typeof window !== "undefined" ? window.location.pathname : "/" }}
        >
          <Icon name="favorite" size="sm" className="mr-2" />
          Guardar en favoritos
        </Link>
      </Button>
    );
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (saved) {
        await removeFavorite(itemType, itemRef);
        setSaved(false);
        toast.success("Quitado de favoritos");
      } else {
        await addFavorite({ userId: user.id, itemType, itemRef, itemTitle, metadata });
        setSaved(true);
        toast.success("Añadido a favoritos");
      }
    } catch (err) {
      toast.error("No pudimos guardar. Intenta de nuevo.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant={variant} size="sm" onClick={toggle} disabled={busy}>
      <Icon name="favorite" size="sm" className={saved ? "mr-2 fill-current" : "mr-2"} />
      {saved ? "En favoritos" : "Guardar en favoritos"}
    </Button>
  );
}
