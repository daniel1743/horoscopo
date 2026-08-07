import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { fetchProfile } from "@/lib/account/repository";
import { EspectroHero } from "@/components/social/espectro/EspectroHero";
import { TodayEnergyCard } from "@/components/social/espectro/TodayEnergyCard";
import { EmotionalCheckIn } from "@/components/social/espectro/EmotionalCheckIn";
import { CompatibilityPreview } from "@/components/social/espectro/CompatibilityPreview";
import { PersonalCorner } from "@/components/social/espectro/PersonalCorner";
import { MyEssenceCard } from "@/components/social/espectro/MyEssenceCard";
import { routes } from "@/config/routes";
import { Settings, ChevronLeft } from "lucide-react";

export function EspectroProfilePage() {
  const { user } = useSession();
  const userId = user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-sand-light">
        <p className="text-ink-muted">Cargando tu energía astral...</p>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-sand-light p-4 text-center">
        <h1 className="font-display text-2xl text-ink">Perfil no encontrado</h1>
        <p className="text-ink-soft">No pudimos cargar tu perfil astral.</p>
      </div>
    );
  }

  return (
    <>

      
      {/* 
        Navegación superior (sección 02)
        Se coloca fixed/absolute sobre la cabecera oscura.
      */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))] lg:pt-6 lg:px-6 pointer-events-none">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors hover:bg-black/40 shadow-sm border border-white/10"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-6 w-6 text-white drop-shadow-md pr-0.5" />
        </button>
        
        <span className="font-display text-white font-medium drop-shadow-md tracking-wide">
          Perfil
        </span>

        {/* Espaciador para centrar 'Perfil' si no hay botón derecho */}
        <div className="w-10 h-10" />
      </div>

      <div className="min-h-screen bg-ivory pb-24 lg:pb-12 isolate">
        <EspectroHero profile={profile} email={user.email} />
        
        <div className="mx-auto mt-6 max-w-xl px-4 sm:px-6">
          <div className="flex flex-col space-y-2">
            <PersonalCorner isOwnProfile={user.id === profile.id} />
            <TodayEnergyCard />
            <EmotionalCheckIn />
            <MyEssenceCard profile={profile} />
            <CompatibilityPreview />
          </div>
        </div>
      </div>
    </>
  );
}
