import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Share2, Edit2, Sun, Moon } from "lucide-react";
import type { PublicProfile } from "@/lib/social/queries";
import { toast } from "sonner";

interface SocialHeaderProps {
  profile: PublicProfile;
  isOwner: boolean;
}

export function SocialHeader({ profile, isOwner }: SocialHeaderProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.display_name ?? profile.username ?? "Perfil",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const displayName = profile.display_name ?? profile.username;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex flex-col w-full bg-white relative pb-8">
      {/* Cover Image */}
      <div className="w-full h-48 md:h-64 bg-sand relative overflow-hidden">
        {profile.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Portada"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-sand to-sand-dark" />
        )}
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 relative">
        {/* Avatar and Action Buttons Row */}
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
          <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-sm bg-white rounded-full">
            <AvatarImage src={profile.avatar_url ?? ""} alt={displayName ?? "Avatar"} className="object-cover" />
            <AvatarFallback className="text-4xl text-ink-muted bg-sand">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
            {isOwner && (
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/mi-espacio/perfil">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Identity Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">{displayName}</h1>
            <p className="text-ink-muted text-sm sm:text-base font-medium">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-ink-soft text-sm sm:text-base max-w-2xl leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

        {/* Astral Identity */}
          {(profile.sun_sign || profile.moon_sign || (profile.favorite_signs && profile.favorite_signs.length > 0)) && (
            <div className="flex flex-col gap-4 pt-4 border-t border-line-subtle mt-4">
              
              {/* Sun and Moon */}
              {(profile.sun_sign || profile.moon_sign) && (
                <div className="flex flex-wrap gap-3">
                  {profile.sun_sign && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warm-white rounded-full text-sm font-medium text-ink shadow-sm border border-line-subtle">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="capitalize">Sol en {profile.sun_sign}</span>
                    </div>
                  )}
                  {profile.moon_sign && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warm-white rounded-full text-sm font-medium text-ink shadow-sm border border-line-subtle">
                      <Moon className="w-4 h-4 text-slate-400" />
                      <span className="capitalize">Luna en {profile.moon_sign}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Favorite Signs */}
              {profile.favorite_signs && profile.favorite_signs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-ink-soft">Signos Favoritos</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_signs.map(sign => (
                      <div key={sign} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize border border-primary/20">
                        {sign}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
