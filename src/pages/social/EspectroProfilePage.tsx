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
import { ChevronLeft, Eye, EyeOff, Menu, Edit, Lock, Share } from "lucide-react";
import { useState } from "react";
import { EspectroEditor } from "@/components/social/espectro/EspectroEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function EspectroProfilePage() {
  const { user } = useSession();
  const userId = user?.id;
  const [viewAsPublic, setViewAsPublic] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  if (isEditing) {
    return (
      <EspectroEditor 
        profile={profile} 
        onClose={() => setIsEditing(false)} 
        onPreviewAsVisitor={() => {
          setIsEditing(false);
          setViewAsPublic(true);
        }}
      />
    );
  }

  return (
    <>

      
      {/* 
        Navegación superior (sección 02)
        Se coloca sticky para cubrir el SiteHeader global.
      */}
      <div className="sticky top-0 left-0 right-0 z-50 grid grid-cols-[44px_1fr_44px] items-center px-4 h-[60px] pt-[env(safe-area-inset-top)] lg:px-6 bg-ivory border-b border-transparent transition-colors shadow-sm">
        
        {/* Left Action (Back) */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent transition-opacity active:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6 text-ink pr-0.5" strokeWidth={2.5} />
        </button>
        
        {/* Center Title (Wordmark) */}
        <div className="flex justify-center pointer-events-none">
          <span className="font-display text-ink font-semibold text-[19px] tracking-wide">
            Creovision
          </span>
        </div>

        {/* Right Action (More) */}
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent transition-opacity active:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Más opciones"
              >
                <Menu className="h-6 w-6 text-ink" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-line-subtle shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2">
              {user?.id === profile.id ? (
                viewAsPublic ? (
                  <>
                    <DropdownMenuItem onClick={() => setViewAsPublic(false)} className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5">
                      <EyeOff className="w-[18px] h-[18px] text-ink-muted" />
                      <span className="font-medium text-[15px] text-ink">Volver a mi vista</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-line-subtle my-1" />
                    <DropdownMenuItem className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5 text-ink-muted opacity-80" disabled>
                      <Share className="w-[18px] h-[18px]" />
                      <span className="font-medium text-[15px]">Compartir perfil</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5">
                      <Edit className="w-[18px] h-[18px] text-ink-muted" />
                      <span className="font-medium text-[15px] text-ink">Personalizar mi espacio</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewAsPublic(true)} className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5">
                      <Eye className="w-[18px] h-[18px] text-ink-muted" />
                      <span className="font-medium text-[15px] text-ink">Ver como visitante</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5 text-ink-muted opacity-80" disabled>
                      <Lock className="w-[18px] h-[18px]" />
                      <span className="font-medium text-[15px]">Privacidad</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-line-subtle my-1" />
                    <DropdownMenuItem className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5 text-ink-muted opacity-80" disabled>
                      <Share className="w-[18px] h-[18px]" />
                      <span className="font-medium text-[15px]">Compartir perfil</span>
                    </DropdownMenuItem>
                  </>
                )
              ) : (
                <>
                  <DropdownMenuItem className="gap-2.5 cursor-pointer py-3 rounded-lg focus:bg-black/5 text-ink-muted opacity-80" disabled>
                    <Share className="w-[18px] h-[18px]" />
                    <span className="font-medium text-[15px]">Compartir perfil</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-screen bg-ivory pb-[calc(var(--bottom-nav-height,80px)+env(safe-area-inset-bottom)+16px)] lg:pb-12 isolate">
        <EspectroHero 
          profile={profile} 
          email={user.email} 
          viewAsPublic={viewAsPublic}
          onEdit={() => setIsEditing(true)}
          onPreviewAsVisitor={() => setViewAsPublic(true)}
        />
        
        <div className="mx-auto mt-4 max-w-xl px-4 sm:px-6">
          <div className="flex flex-col space-y-4">
            {!viewAsPublic && <PersonalCorner />}
            <TodayEnergyCard />
            {!viewAsPublic && <EmotionalCheckIn />}
            <MyEssenceCard profile={profile} />
            {!viewAsPublic && <CompatibilityPreview />}
          </div>
        </div>
      </div>
    </>
  );
}
