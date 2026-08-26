import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useSession";
import { createCommunityPost, type CommunityPostType } from "@/lib/account/repository";
import { communityPostTypes } from "@/config/community";
import { routes } from "@/config/routes";
import { toast } from "sonner";

interface Props {
  initialPostType?: CommunityPostType;
  initialTitle?: string;
  initialBody?: string;
  sourceRef?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  onPublished?: () => void;
}

export function CommunityPostComposer({
  initialPostType = "reflection",
  initialTitle = "",
  initialBody = "",
  sourceRef = null,
  sourceTitle = null,
  sourceUrl = null,
  onPublished,
}: Props) {
  const { user } = useSession();
  const [postType, setPostType] = useState<CommunityPostType>(initialPostType);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="rounded-[var(--radius-card-lg)] border border-brand/20 bg-brand-soft/30 p-5 md:p-6">
        <p className="font-display text-[20px] font-semibold text-ink">
          ¿Quieres compartir tu lectura?
        </p>
        <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
          Inicia sesión para publicar en el muro. Lo que guardas permanece privado hasta que decidas
          compartirlo.
        </p>
        <Button asChild className="mt-4">
          <Link to={routes.auth}>Iniciar sesión para publicar</Link>
        </Button>
      </div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanBody = body.trim();
    if (cleanBody.length < 8) {
      toast.error("Escribe al menos unas palabras para que tu publicación tenga contexto.");
      return;
    }
    setBusy(true);
    try {
      await createCommunityPost({
        userId: user.id,
        postType,
        title,
        body: cleanBody,
        sourceRef,
        sourceTitle,
        sourceUrl,
        visibility: "public",
      });
      setTitle("");
      setBody("");
      toast.success("Publicación compartida en el muro.");
      onPublished?.();
    } catch {
      toast.error("No pudimos publicar ahora. Comprueba tu sesión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-5 shadow-soft md:p-6"
    >
      <div className="flex flex-col gap-1">
        <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
          Comparte con intención
        </p>
        <h2 className="font-display text-[23px] font-semibold text-ink">
          ¿Qué quieres dejar en el muro?
        </h2>
        <p className="font-body text-[14px] leading-[1.6] text-ink-soft">
          Publica una reflexión o una lectura que quieras compartir. Evita datos privados y recuerda
          que podrás ocultarla después.
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="community-post-type">Tipo</Label>
          <select
            id="community-post-type"
            value={postType}
            onChange={(event) => setPostType(event.target.value as CommunityPostType)}
            className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3 font-body text-[14px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          >
            {communityPostTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="community-post-title">Título (opcional)</Label>
          <Input
            id="community-post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Una idea que quiero compartir"
          />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <Label htmlFor="community-post-body">Tu publicación</Label>
        <Textarea
          id="community-post-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Escribe qué observaste, qué te resonó o qué quieres desearle a la comunidad…"
        />
        <div className="flex items-center justify-between font-body text-[12px] text-ink-muted">
          <span>Publicación pública, sin preguntas privadas.</span>
          <span>{body.length}/2000</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[42ch] font-body text-[12px] leading-[1.5] text-ink-muted">
          Al publicar confirmas que este texto puede ser visible para otros miembros.
        </p>
        <Button type="submit" disabled={busy || body.trim().length < 8}>
          {busy ? "Publicando…" : "Publicar en el muro"}
        </Button>
      </div>
    </form>
  );
}
