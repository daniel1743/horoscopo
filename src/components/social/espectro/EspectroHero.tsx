import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/lib/account/repository";
import { useSession } from "@/hooks/useSession";
import { uploadProfileImage } from "@/lib/storage/upload";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/account/repository";
import { toast } from "sonner";
import { Loader2, Camera, Heart, Sparkles, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  profile: Partial<Profile>;
  email?: string;
}

export function EspectroHero({ profile, email }: Props) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const isOwnProfile = user?.id === profile.id;

  const displayName = profile.display_name || profile.username || email?.split("@")[0] || "Explorador";
  const initial = displayName.charAt(0).toUpperCase();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);


  // Mock data para el concepto de espacio personal
  const personalPhrase = "Estoy aprendiendo a confiar en mi proceso.";
  const auraTheme = "mystic-sky"; // Mocks the "cielo místico" aura theme

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);
      const url = await uploadProfileImage(file, user.id, "avatar");
      
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      await upsertProfile(user.id, { avatar_url: url });
      
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Foto de perfil actualizada.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingCover(true);
      const url = await uploadProfileImage(file, user.id, "cover");
      
      await upsertProfile(user.id, { cover_url: url });
      
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Foto de portada actualizada.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Hidden Inputs */}
      {isOwnProfile && (
        <>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            ref={coverInputRef}
            onChange={handleCoverChange}
            disabled={uploadingCover}
          />
        </>
      )}

      {/* Background Header (Aura / Cosmic Space) */}
      <button 
        type="button"
        disabled={!isOwnProfile || uploadingCover}
        onClick={() => isOwnProfile && coverInputRef.current?.click()}
        className={`w-full h-[240px] md:h-[300px] relative overflow-hidden flex flex-col justify-end ${isOwnProfile ? "cursor-pointer group" : ""} bg-night`}
        aria-label={isOwnProfile ? "Cambiar foto de portada" : undefined}
      >
        {/* Capa base de Aura (resplandor radial cálido/místico) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-dark/40 via-night to-night pointer-events-none" />

        {/* Banner/Portada con máscara para que se funda sutilmente en la cabecera oscura */}
        {profile.cover_url ? (
          <>
            <img
              src={profile.cover_url}
              alt="Portada astral"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen transition-opacity group-hover:opacity-30"
            />
            {/* Gradiente para fundir la imagen con el fondo oscuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night/50 to-night pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night opacity-90 transition-opacity group-hover:opacity-70" />
        )}

        {isOwnProfile && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white/80">
            {uploadingCover ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Camera className="w-8 h-8 drop-shadow-md" />
            )}
          </div>
        )}
        
        {/* Floating Badges (2026 UI/UX Spatial Design)
            Colocados en vertical a la derecha para evitar superposición con el avatar en pantallas pequeñas (estilo Reels/TikTok side actions, altamente inmersivo).
        */}
        <div className="absolute bottom-12 right-4 md:right-6 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Heart className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">1.2k</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Sparkles className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">340</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Users className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">328</span>
          </div>
        </div>

        {/* Curva Orgánica Inferior para transición al body claro */}
        <svg 
          viewBox="0 0 100 24" 
          preserveAspectRatio="none" 
          className="w-full h-[32px] text-ivory relative z-10 block pointer-events-none"
          aria-hidden="true"
          style={{ transform: "translateY(1px)" }} /* Prevents 1px gap rendering issues */
        >
          <path d="M0,24 L0,12 C40,0 60,0 100,12 L100,24 Z" fill="currentColor" />
        </svg>
      </button>

      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 relative flex flex-col items-center pb-4">
        {/* Avatar Protagonista con Ring Fino */}
        <div className="relative -mt-20 mb-4 z-20">
          <button
            type="button"
            disabled={!isOwnProfile || uploadingAvatar}
            onClick={() => isOwnProfile && avatarInputRef.current?.click()}
            className={`relative rounded-full outline-none focus-visible:ring-4 focus-visible:ring-brand focus-visible:ring-offset-2 ${isOwnProfile ? "cursor-pointer group" : ""}`}
            aria-label={isOwnProfile ? "Cambiar foto de perfil" : undefined}
          >
            <Avatar className="w-32 h-32 sm:w-36 sm:h-36 shadow-lg bg-night rounded-full relative ring-4 ring-ivory border-[1px] border-line-subtle transition-transform group-hover:scale-[1.02]">
              <AvatarImage src={profile.avatar_url ?? ""} alt={displayName} className="object-cover" />
              <AvatarFallback className="text-4xl text-ink-inverse font-medium bg-night-elevated">
                {initial}
              </AvatarFallback>
            </Avatar>

            {isOwnProfile && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 ring-4 ring-transparent">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <Camera className="w-8 h-8 text-white drop-shadow-md" />
                )}
              </div>
            )}
          </button>
        </div>

        {/* Info & Identity */}
        <div className="text-center w-full">
          <h1 className="font-display text-[26px] sm:text-3xl font-semibold text-ink leading-tight tracking-tight">
            {displayName}
          </h1>
          {profile.username && (
            <p className="text-ink-muted font-body text-sm mt-0.5">
              @{profile.username}
            </p>
          )}

          {/* Astral Identity (Sol, Luna, Ascendente) */}
          {(profile.sun_sign || profile.moon_sign) && (
            <div className="flex items-center justify-center gap-2 mt-2.5 text-[14px] font-medium text-brand/90">
              {profile.sun_sign && <span>☀️ <span className="capitalize">{profile.sun_sign}</span></span>}
              {profile.sun_sign && profile.moon_sign && <span className="text-line-dark/30">•</span>}
              {profile.moon_sign && <span>🌙 <span className="capitalize">{profile.moon_sign}</span></span>}
              <span className="text-line-dark/30">•</span>
              <span>↑ Libra</span>
            </div>
          )}

          {/* Frase Personal (Alma / Intimidad) */}
          <div className="mt-5 px-6">
            <p className="font-display italic text-[17px] text-ink-soft leading-relaxed text-balance">
              "{personalPhrase}"
            </p>
          </div>

          {/* Bio standard (secundaria) */}
          {profile.bio && (
            <p className="text-ink-muted text-[14px] max-w-[280px] sm:max-w-sm mx-auto leading-relaxed whitespace-pre-wrap mt-3">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
