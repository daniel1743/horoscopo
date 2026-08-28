import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { fetchPublicProfileByUsername, type PublicProfile } from "@/lib/social/queries";
import { SocialHeader } from "@/components/profile/SocialHeader";
import { Icon } from "@/components/ui/icon";

export function PublicProfilePage({ initialProfile }: { initialProfile?: PublicProfile }) {
  const { username } = useParams({ strict: false }) as { username?: string };
  const { user } = useSession();

  const [profile, setProfile] = useState<PublicProfile | null>(initialProfile ?? null);
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setLoading(false);
      setError(null);
      return;
    }

    if (!username) {
      setError("Usuario no especificado");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchPublicProfileByUsername(username)
      .then((data) => {
        if (!data) {
          setError("Perfil no encontrado");
        } else {
          setProfile(data);
        }
      })
      .catch(() => setError("Error al cargar el perfil"))
      .finally(() => setLoading(false));
  }, [initialProfile, username]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center">
        <Icon name="premium" className="h-8 w-8 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-ink">Perfil no encontrado</h1>
        <p className="text-ink-soft">
          El perfil que buscas no existe o no tiene un nombre de usuario configurado.
        </p>
      </div>
    );
  }

  const isOwner = Boolean(user && user.id === profile.id);

  return (
    <div className="min-h-screen w-full bg-sand-light">
      <SocialHeader profile={profile} isOwner={isOwner} />
    </div>
  );
}
