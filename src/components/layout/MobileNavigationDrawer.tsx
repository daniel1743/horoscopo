import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/hooks/useSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfileImage } from "@/lib/storage/upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer secundario móvil. Estado controlado por SiteHeader (single source).
 * Cierra sincrónicamente al navegar con onClick={onClose}.
 */
export function MobileNavigationDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { user } = useSession();
  const isAuthed = !!user;
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock + Escape + focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Focus panel para el trap básico
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const handleAvatarClick = () => {
    if (!user) return;
    if (user.user_metadata?.avatar_url) {
      const confirmChange = window.confirm("¿Deseas cambiar tu foto de perfil?");
      if (!confirmChange) return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const url = await uploadProfileImage(file, user.id, "avatar");
      
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      
      if (error) throw error;
      toast.success("Foto de perfil actualizada.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Arquitectura de navegación principal
  const mainGroups = [
    {
      id: "explore",
      title: "Explorar",
      items: [
        { label: "Inicio", route: routes.home, icon: "home" as const },
        { label: "Horóscopo", route: routes.horoscope, icon: "sun" as const },
        { label: "Tarot", route: routes.tarot, icon: "tarot" as const },
        { label: "Luna", route: routes.moon, icon: "moon" as const },
        { label: "Guías", route: routes.guides, icon: "article" as const },
      ],
    },
    isAuthed
      ? {
          id: "personal",
          title: "Tu espacio",
          items: [
            { label: "Favoritos", route: routes.favorites, icon: "favorite" as const },
            { label: "Historial", route: routes.history, icon: "history" as const },
          ],
        }
      : {
          id: "personal",
          title: "Tu espacio",
          items: [
            { label: "Iniciar sesión", route: routes.signIn, icon: "user" as const },
            { label: "Crear cuenta", route: `${routes.signIn}?mode=signup`, icon: "user" as const },
          ],
        },
    isAuthed
      ? {
          id: "account",
          title: "Cuenta",
          items: [
            { label: "Configuración", route: routes.settings, icon: "settings" as const },
          ],
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    title: string;
    items: Array<{ label: string; route: string; icon?: any }>;
  }>;

  // Navegación secundaria eliminada por solicitud
  const secondaryLinks: Array<{ label: string; route: string }> = [];

  return (
    <div
      className="fixed inset-y-0 left-0 z-[60] flex h-full w-[85vw] max-w-[360px] flex-col bg-ivory outline-none lg:hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Menú principal"
      id="mobile-navigation-drawer"
      ref={panelRef}
      tabIndex={-1}
    >
      {/* Header Premium con Fondo Imagen y Curva */}
      <div 
        className="relative h-[180px] shrink-0 overflow-hidden bg-brand-soft/50"
        style={{ 
          paddingTop: "env(safe-area-inset-top)",
          backgroundImage: "url('/fodo menu.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Velo cálido sutil para contraste del contenido (sin blend modes) */}
        <div className="pointer-events-none absolute inset-0 bg-[rgba(24,20,18,0.12)]" />

        {/* Fade inferior hacia la superficie del body */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[56px] bg-gradient-to-b from-transparent to-ivory" />

        {/* Curva Orgánica Inferior */}
        <svg 
          viewBox="0 0 100 24" 
          preserveAspectRatio="none" 
          className="absolute bottom-0 left-0 w-full h-[32px] text-ivory z-10 pointer-events-none"
          aria-hidden="true"
        >
          <path d="M0,24 L0,18 C40,18 60,0 100,0 L100,24 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Identidad / Avatar */}
      <div className="px-6 -mt-[50px] relative z-20 mb-8 shrink-0">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        {isAuthed ? (
          <>
            <button 
              onClick={handleAvatarClick}
              disabled={uploading}
              className="relative rounded-full outline-none focus-visible:ring-4 focus-visible:ring-brand focus-visible:ring-offset-2 transition-transform hover:scale-[1.02] active:scale-95"
              aria-label="Cambiar foto de perfil"
            >
              <Avatar className="h-[96px] w-[96px] rounded-full ring-[4px] ring-brand ring-offset-[2px] ring-offset-warm-white shadow-[0_8px_22px_rgba(20,16,20,0.12)] bg-warm-white">
                <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-brand-soft text-brand text-2xl font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </button>
            <div className="mt-4">
              <h2 className="font-display text-[22px] font-semibold text-ink leading-tight tracking-tight">
                {user?.user_metadata?.name || user?.email?.split("@")[0] || "Explorador"}
              </h2>
              <p className="font-body text-[14px] text-ink-muted mt-0.5">
                {user?.email ? `@${user.email.split("@")[0]}` : "Bienvenido de nuevo"}
              </p>
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-[96px] w-[96px] rounded-full ring-[4px] ring-brand ring-offset-[2px] ring-offset-warm-white shadow-[0_8px_22px_rgba(20,16,20,0.12)] bg-warm-white">
              <AvatarFallback className="bg-brand-soft text-brand text-2xl font-semibold">
                ?
              </AvatarFallback>
            </Avatar>
            <div className="mt-4">
              <h2 className="font-display text-[22px] font-semibold text-ink leading-tight tracking-tight">
                Tu espacio en Creovision
              </h2>
              <p className="font-body text-[14px] text-ink-muted mt-1">
                Guarda lecturas y personaliza tu experiencia.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navegación */}
      <div className="flex-1 px-5 pb-2 shrink-0">
        {mainGroups.map((group, idx) => (
          <div key={group.id} className={idx > 0 ? "mt-7" : ""}>
            <p className="mb-3 px-2 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.route}
                    onClick={onClose}
                    activeProps={{
                      className: "bg-brand-soft/60 shadow-[0_5px_16px_rgba(20,16,20,0.07)] text-brand font-medium [&>svg]:text-brand",
                    }}
                    inactiveProps={{
                      className: "text-ink hover:bg-brand-soft/40 font-normal [&>svg]:text-ink-soft",
                    }}
                    className="flex min-h-[48px] items-center gap-3.5 rounded-[14px] px-3.5 py-2 font-body text-[15px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {item.icon && <Icon name={item.icon} size="sm" className="transition-colors" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto px-6 pb-6 shrink-0" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        {isAuthed ? (
          <div className="flex flex-col gap-2">
            <Link
              to={routes.account}
              onClick={onClose}
              className="flex min-h-[44px] items-center justify-center rounded-[14px] bg-brand-soft/50 font-body text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
            >
              Ver mi perfil
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              to={routes.signIn}
              onClick={onClose}
              className="flex min-h-[44px] items-center justify-center rounded-[14px] bg-brand font-body text-[14px] font-medium text-ink-inverse transition-colors hover:bg-brand-hover shadow-sm"
            >
              Iniciar sesión
            </Link>
            <Link
              to={`${routes.signIn}?mode=signup`}
              onClick={onClose}
              className="flex min-h-[44px] items-center justify-center rounded-[14px] font-body text-[14px] font-medium text-ink hover:bg-brand-soft/40 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        )}
        <p className="mt-6 text-center font-body text-[11px] text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </div>
  );
}
