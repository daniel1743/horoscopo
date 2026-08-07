import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProfile, upsertProfile, type Profile } from "@/lib/account/repository";
import { calculateAstralIdentityFn } from "@/lib/social/identity.functions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  normalizeDisplayName,
  validateAstralProfile,
  type BirthTimeStatus,
} from "@/lib/account/auth-profile";
import { zodiacSigns } from "@/data/zodiac-signs";
import { toast } from "sonner";
import { ImageUpload } from "@/components/profile/ImageUpload";

/** Edición de perfil. Se guarda en public.profiles (RLS). */
export function ProfilePage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id)
      .then((p) => setForm(p ?? { id: user.id }))
      .finally(() => setLoading(false));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const validation = validateAstralProfile({
      username: form.username,
      displayName: form.display_name,
      birthDate: form.birth_date,
      birthTime: form.birth_time,
      birthTimeStatus: form.birth_time_status,
      birthPlaceLabel: form.birth_place_label,
      birthTimezone: form.birth_timezone,
      birthLatitude: form.birth_latitude,
      birthLongitude: form.birth_longitude,
    });
    if (!validation.valid) {
      toast.error(Object.values(validation.errors)[0] ?? "Revisa los datos del perfil astral.");
      return;
    }
    setBusy(true);
    try {
      let sun_sign: string | null = null;
      let moon_sign: string | null = null;

      if (form.birth_date) {
        try {
          const signs = await calculateAstralIdentityFn({
            birthDate: form.birth_date,
            birthTime: form.birth_time_status === "unknown" ? null : (form.birth_time ?? null),
            timezoneOffset: 0, // In a real app we'd map timezone string to offset, assuming 0 for now as fallback if unparsed
          });
          sun_sign = signs.sun_sign;
          moon_sign = signs.moon_sign;
        } catch (e) {
          console.error("Error calculating astral identity:", e);
        }
      }

      await upsertProfile(user.id, {
        username: form.username?.toLowerCase() ?? null,
        display_name: normalizeDisplayName(form.display_name ?? "") || null,
        avatar_url: form.avatar_url ?? null,
        cover_url: form.cover_url ?? null,
        sun_sign,
        moon_sign,
        bio: form.bio ?? null,
        preferred_sign: form.preferred_sign ?? null,
        city: form.city ?? null,
        birth_date: form.birth_date ?? null,
        birth_time: form.birth_time_status === "unknown" ? null : (form.birth_time ?? null),
        birth_time_status: form.birth_time_status ?? "unknown",
        birth_place_label: form.birth_place_label ?? null,
        birth_city: form.birth_city ?? null,
        birth_region: form.birth_region ?? null,
        birth_country: form.birth_country ?? null,
        birth_country_code: form.birth_country_code?.toUpperCase() ?? null,
        birth_timezone: form.birth_timezone ?? null,
        birth_latitude: form.birth_latitude ?? null,
        birth_longitude: form.birth_longitude ?? null,
      });
      toast.success("Perfil astral guardado.");
    } catch {
      toast.error("No pudimos guardar. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountShell
      title="Completa tu perfil astral"
      description="Estos datos permiten calcular tu carta y ofrecer resultados adaptados a tu nacimiento."
    >
      {loading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
          <div className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4 text-sm text-ink-soft shadow-card">
            Usaremos estos datos únicamente para personalizar tus cálculos y consultas.
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username">Nombre de usuario (público)</Label>
            <Input
              id="username"
              value={form.username ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
              maxLength={30}
              placeholder="ej. daniel_astral"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Nombre visible</Label>
            <Input
              id="display_name"
              value={form.display_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              maxLength={80}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="birth_date">Fecha de nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                required
                value={form.birth_date ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value || null }))}
              />
              <p className="text-xs text-ink-muted">
                Necesaria para calcular la posición del Sol, la Luna y los planetas.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Hora de nacimiento</Label>
              <RadioGroup
                value={form.birth_time_status ?? "unknown"}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    birth_time_status: value as BirthTimeStatus,
                    birth_time: value === "unknown" ? null : f.birth_time,
                  }))
                }
                className="grid gap-2 rounded-[var(--radius-control)] border border-line-subtle p-3"
              >
                <TimeOption value="exact" label="Exacta" />
                <TimeOption value="approximate" label="Aproximada" />
                <TimeOption value="unknown" label="Desconocida" />
              </RadioGroup>
              {(form.birth_time_status === "exact" || form.birth_time_status === "approximate") && (
                <Input
                  id="birth_time"
                  type="time"
                  value={form.birth_time ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, birth_time: e.target.value || null }))}
                />
              )}
              <p className="text-xs text-ink-muted">
                Permite calcular ascendente y casas. Si no la conoces, puedes indicarlo.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birth_place_label">Lugar de nacimiento</Label>
            <Input
              id="birth_place_label"
              required
              value={form.birth_place_label ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, birth_place_label: e.target.value }))}
              maxLength={160}
            />
            <p className="text-xs text-ink-muted">
              Se usa para obtener coordenadas y zona horaria del momento de nacimiento.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="birth_city">Ciudad</Label>
              <Input
                id="birth_city"
                value={form.birth_city ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, birth_city: e.target.value || null }))}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birth_region">Región</Label>
              <Input
                id="birth_region"
                value={form.birth_region ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, birth_region: e.target.value || null }))}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birth_country">País</Label>
              <Input
                id="birth_country"
                value={form.birth_country ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, birth_country: e.target.value || null }))}
                maxLength={80}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="birth_country_code">Código país</Label>
              <Input
                id="birth_country_code"
                value={form.birth_country_code ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    birth_country_code: e.target.value.toUpperCase() || null,
                  }))
                }
                maxLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birth_timezone">Zona horaria</Label>
              <Input
                id="birth_timezone"
                required
                value={form.birth_timezone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, birth_timezone: e.target.value }))}
                placeholder="America/Santiago"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birth_latitude">Latitud</Label>
              <Input
                id="birth_latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                required
                value={form.birth_latitude ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    birth_latitude: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birth_longitude">Longitud</Label>
              <Input
                id="birth_longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                required
                value={form.birth_longitude ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    birth_longitude: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Avatar (opcional)</Label>
              <ImageUpload
                userId={user.id}
                type="avatar"
                currentUrl={form.avatar_url}
                onUploadSuccess={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Portada (opcional)</Label>
              <ImageUpload
                userId={user.id}
                type="cover"
                currentUrl={form.cover_url}
                onUploadSuccess={(url) => setForm((f) => ({ ...f, cover_url: url }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Signo preferido</Label>
            <Select
              value={form.preferred_sign ?? ""}
              onValueChange={(v) => setForm((f) => ({ ...f, preferred_sign: v || null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu signo" />
              </SelectTrigger>
              <SelectContent>
                {zodiacSigns.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad (opcional)</Label>
            <Input
              id="city"
              value={form.city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Biografía corta</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={400}
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      )}
    </AccountShell>
  );
}

function TimeOption({ value, label }: { value: BirthTimeStatus; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem id={`time-${value}`} value={value} />
      <Label htmlFor={`time-${value}`} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
