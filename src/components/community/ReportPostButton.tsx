import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useSession";
import { reportCommunityPost, type CommunityReportReason } from "@/lib/account/repository";
import { communityReportReasons } from "@/config/community";
import { routes } from "@/config/routes";
import { toast } from "sonner";

interface Props {
  postId: string;
}

export function ReportPostButton({ postId }: Props) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CommunityReportReason>("other");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <Link
        to={routes.signIn}
        search={{ redirect: "/comunidad", mode: "signin" }}
        className="font-body text-[12px] text-ink-muted hover:text-brand hover:underline"
      >
        Inicia sesión para reportar
      </Link>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await reportCommunityPost({ postId, reporterId: user.id, reason, details });
      toast.success("Gracias. Revisaremos esta publicación.");
      setOpen(false);
      setDetails("");
    } catch {
      toast.error("No pudimos registrar el reporte. Puede que ya lo hayas enviado.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="font-body text-[12px] text-ink-muted hover:text-brand hover:underline"
        >
          Reportar publicación
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar publicación</DialogTitle>
          <DialogDescription>
            Ayúdanos a cuidar el muro. El reporte es privado y no se muestra públicamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`report-reason-${postId}`}>Motivo</Label>
            <select
              id={`report-reason-${postId}`}
              value={reason}
              onChange={(event) => setReason(event.target.value as CommunityReportReason)}
              className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3 font-body text-[14px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
            >
              {communityReportReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`report-details-${postId}`}>Detalle opcional</Label>
            <Textarea
              id={`report-details-${postId}`}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Cuéntanos qué deberíamos revisar…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Enviando…" : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
