import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { fetchPublicProfileByUsername, type PublicProfile } from "@/lib/social/queries";
import { SocialHeader } from "@/components/profile/SocialHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Loader2 } from "lucide-react";

export function PublicProfilePage() {
  const { username } = useParams({ strict: false }) as { username?: string };
  const { user } = useSession();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [username]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-ink-muted" />
        </div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-2xl font-bold text-ink mb-2">Perfil no encontrado</h1>
          <p className="text-ink-soft">El perfil que buscas no existe o no tiene un nombre de usuario configurado.</p>
        </div>
      </AppShell>
    );
  }

  const isOwner = Boolean(user && user.id === profile.id);

  return (
    <AppShell>
      <div className="w-full bg-sand-light min-h-screen">
        <SocialHeader profile={profile} isOwner={isOwner} />
      </div>
    </AppShell>
  );
}
