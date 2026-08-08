import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera, ArrowLeft } from "lucide-react";
import { type Profile, upsertProfile } from "@/lib/account/repository";
import { type AuraTheme, type AuraVisibility } from "@/lib/social/aura-resolver";
import { uploadProfileImage } from "@/lib/storage/upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const THEMES: { id: AuraTheme; label: string; description: string }[] = [
  { id: "indigo", label: "Índigo", description: "Profunda · introspectiva · magnética" },
  { id: "lunar", label: "Azul lunar", description: "Serena · intuitiva · sensible" },
  { id: "emerald", label: "Esmeralda", description: "Renovación · equilibrio · crecimiento" },
  { id: "rose", label: "Rosa Aura", description: "Afectiva · cálida · sensible" },
  { id: "solar", label: "Dorado Solar", description: "Optimista · expansiva · luminosa" },
  { id: "pearl", label: "Perla", description: "Serena · limpia · minimalista" }
];

interface Props {
  profile: Profile;
  onClose: () => void;
  onPreviewAsVisitor: () => void;
}

export function EspectroEditor({ profile, onClose, onPreviewAsVisitor }: Props) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<AuraTheme>((profile.aura_theme as AuraTheme) || "indigo");
  const [motionEnabled, setMotionEnabled] = useState(profile.aura_motion_enabled ?? true);
  const [visibility, setVisibility] = useState<AuraVisibility>((profile.aura_visibility as AuraVisibility) || "public");
  
  const [phrase, setPhrase] = useState(profile.declared_energy_text || "Estoy aprendiendo a confiar en mi proceso.");
  const [cornerText, setCornerText] = useState("Hoy elijo soltar el control y dejar que la energía fluya hacia donde debe. Observar sin juzgar."); // mock text

  const displayName = profile.display_name || profile.username || "Explorador";
  const initial = displayName.charAt(0).toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const url = await uploadProfileImage(file, profile.id, "avatar");
      
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      await upsertProfile(profile.id, { avatar_url: url });
      
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
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
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await uploadProfileImage(file, profile.id, "cover");
      
      await upsertProfile(profile.id, { cover_url: url });
      
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      toast.success("Foto de portada actualizada.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await upsertProfile(profile.id, {
        aura_theme: theme,
        aura_motion_enabled: motionEnabled,
        aura_visibility: visibility,
        declared_energy_text: phrase,
        // En el futuro: corner_text: cornerText
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      toast.success("Espacio actualizado correctamente");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar tu espacio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-light pb-24">
      {/* Hidden inputs */}
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

      {/* Header */}
      <div className="sticky top-0 z-40 bg-sand-light/80 backdrop-blur-md border-b border-line-subtle px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="font-display text-xl font-medium text-ink">Personaliza tu espacio</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-10">
        
        {/* Images */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold font-display uppercase tracking-wider text-ink-muted">Imágenes</Label>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group"
            >
              <Avatar className="w-24 h-24 ring-2 ring-line-subtle transition-transform group-hover:scale-105">
                <AvatarImage src={profile.avatar_url ?? ""} alt="Avatar" className="object-cover" />
                <AvatarFallback className="text-2xl bg-white text-ink-muted">{initial}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
            </button>
            <div className="flex-1 space-y-1">
              <p className="font-display font-medium text-ink">Foto de perfil</p>
              <p className="text-sm text-ink-muted">Toca para cambiar</p>
            </div>
          </div>

          <div className="relative h-[120px] rounded-2xl overflow-hidden group cursor-pointer border border-line-subtle" onClick={() => coverInputRef.current?.click()}>
            {profile.cover_url ? (
              <img src={profile.cover_url} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-line-subtle/50 flex items-center justify-center" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white">
              {uploadingCover ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6 mb-1" />}
              <span className="text-sm font-medium">Cambiar portada</span>
            </div>
          </div>
        </div>

        {/* Aura */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold font-display uppercase tracking-wider text-ink-muted">Tu Aura</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${
                  theme === t.id 
                    ? "border-brand bg-brand-soft/30 ring-1 ring-brand" 
                    : "border-line-subtle bg-white hover:border-line"
                }`}
              >
                <span className={`font-display text-sm font-medium ${theme === t.id ? "text-brand" : "text-ink"}`}>
                  {t.label}
                </span>
                <span className="font-body text-[11px] text-ink-muted leading-tight mt-1 line-clamp-2">
                  {t.description}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-line-subtle mt-4">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold font-display text-ink">Aura Dinámica</Label>
              <p className="text-[13px] text-ink-muted font-body">Permite que tu aura respire suavemente.</p>
            </div>
            <Switch checked={motionEnabled} onCheckedChange={setMotionEnabled} />
          </div>
        </div>

        {/* Texts */}
        <div className="space-y-6">
          <Label className="text-sm font-semibold font-display uppercase tracking-wider text-ink-muted">Expresión Personal</Label>
          
          <div className="space-y-2">
            <Label className="font-display font-medium text-ink text-base">Tu Frase</Label>
            <Input 
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Estoy aprendiendo a confiar..."
              className="bg-white rounded-xl border-line-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-display font-medium text-ink text-base">Mi Rincón</Label>
            <Textarea 
              value={cornerText}
              onChange={(e) => setCornerText(e.target.value)}
              placeholder="Hoy elijo soltar el control..."
              className="bg-white rounded-xl border-line-subtle resize-none h-24"
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold font-display uppercase tracking-wider text-ink-muted">Visibilidad Global</Label>
          <Select value={visibility} onValueChange={(val) => setVisibility(val as AuraVisibility)}>
            <SelectTrigger className="w-full rounded-xl bg-white border-line-subtle h-12">
              <SelectValue placeholder="Selecciona quién puede ver tu Aura" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="public">Público (Todos)</SelectItem>
              <SelectItem value="connections">Solo Conexiones</SelectItem>
              <SelectItem value="private">Privado (Solo yo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="w-full rounded-xl h-12 font-medium bg-white border-line"
            onClick={onPreviewAsVisitor}
          >
            Ver como visitante
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-12 font-medium border-line"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-[2] rounded-xl h-12 font-medium bg-brand hover:bg-brand-dark text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
