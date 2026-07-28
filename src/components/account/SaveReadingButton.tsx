import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  saveTarotReading,
  fetchPrivacySettings,
  type SpreadType,
  type SavedReadingCard,
} from "@/lib/account/repository";
import { toast } from "sonner";

interface Props {
  spreadType: SpreadType;
  cards: SavedReadingCard[];
  interpretation?: string;
}

/**
 * Guarda una lectura de tarot SOLO tras acción explícita del usuario.
 * Nunca se persiste la pregunta original: solo cartas + interpretación + nota opcional.
 */
export function SaveReadingButton({ spreadType, cards, interpretation }: Props) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link
          to={routes.signIn}
          search={{ redirect: typeof window !== "undefined" ? window.location.pathname : "/" }}
        >
          <Icon name="favorite" size="sm" className="mr-2" />
          Guardar lectura
        </Link>
      </Button>
    );
  }

  const submit = async () => {
    setBusy(true);
    try {
      const privacy = await fetchPrivacySettings(user.id);
      if (!privacy.save_readings_allowed) {
        toast.error(
          "Guardar lecturas está desactivado en tus preferencias de privacidad.",
        );
        return;
      }
      await saveTarotReading({
        userId: user.id,
        spreadType,
        cards,
        interpretation: interpretation ?? null,
        note: note.trim() || null,
      });
      toast.success("Lectura guardada en Mi espacio.");
      setOpen(false);
      setNote("");
    } catch (err) {
      console.error(err);
      toast.error("No pudimos guardar la lectura.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Icon name="favorite" size="sm" className="mr-2" />
        Guardar lectura
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar esta lectura</DialogTitle>
            <DialogDescription>
              Guardaremos únicamente las cartas y la interpretación. No guardamos tu
              pregunta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="save-reading-note">Nota personal (opcional)</Label>
            <Textarea
              id="save-reading-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Anota una impresión o reflexión."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
