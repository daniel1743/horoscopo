import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchProfile, upsertProfile, fetchPrivacySettings, updatePrivacySettings, isUsernameAvailable } from "@/lib/account/repository";
import { calculateAstralIdentityFn } from "@/lib/social/identity.functions";
import { normalizeDisplayName } from "@/lib/account/auth-profile";
import { profileFormSchema, type ProfileFormValues } from "@/lib/account/profile.schema";
import { zodiacSigns } from "@/data/zodiac-signs";
import { toast } from "sonner";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ProfilePage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      avatar_url: "",
      cover_url: "",
      preferred_sign: "",
      favorite_signs: [],
      show_sun_sign: true,
      show_moon_sign: false,
      show_favorite_signs: true,
      birth_date: "",
      birth_time_status: "unknown",
      birth_time: "",
      birth_place_label: "",
      birth_city: "",
      birth_region: "",
      birth_country: "",
      birth_country_code: "",
      birth_timezone: "",
      birth_latitude: 0,
      birth_longitude: 0,
      city: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProfile(user.id), fetchPrivacySettings(user.id)])
      .then(([p, privacy]) => {
        if (p) {
          form.reset({
            username: p.username ?? "",
            display_name: p.display_name ?? "",
            bio: p.bio ?? "",
            avatar_url: p.avatar_url ?? "",
            cover_url: p.cover_url ?? "",
            preferred_sign: p.preferred_sign ?? "",
            favorite_signs: p.favorite_signs ?? [],
            show_sun_sign: privacy?.show_sun_sign ?? true,
            show_moon_sign: privacy?.show_moon_sign ?? false,
            show_favorite_signs: privacy?.show_favorite_signs ?? true,
            birth_date: p.birth_date ?? "",
            birth_time_status: p.birth_time_status ?? "unknown",
            birth_time: p.birth_time ?? "",
            birth_place_label: p.birth_place_label ?? "",
            birth_city: p.birth_city ?? "",
            birth_region: p.birth_region ?? "",
            birth_country: p.birth_country ?? "",
            birth_country_code: p.birth_country_code ?? "",
            birth_timezone: p.birth_timezone ?? "",
            birth_latitude: p.birth_latitude ?? 0,
            birth_longitude: p.birth_longitude ?? 0,
            city: p.city ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setBusy(true);
    
    try {
      if (data.username) {
        const available = await isUsernameAvailable(data.username, user.id);
        if (!available) {
          form.setError("username", { type: "manual", message: "Este nombre de usuario ya está en uso." });
          setBusy(false);
          return;
        }
      }

      let sun_sign: string | null = null;
      let moon_sign: string | null = null;

      if (data.birth_date) {
        try {
          const signs = await calculateAstralIdentityFn({
            birthDate: data.birth_date,
            birthTime: data.birth_time_status === "unknown" ? null : (data.birth_time ?? null),
            timezoneOffset: 0, // Placeholder
          });
          sun_sign = signs.sun_sign;
          moon_sign = signs.moon_sign;
        } catch (e) {
          console.error("Error calculating astral identity:", e);
        }
      }

      await Promise.all([
        upsertProfile(user.id, {
          username: data.username?.toLowerCase() || null,
          display_name: normalizeDisplayName(data.display_name ?? "") || null,
          avatar_url: data.avatar_url || null,
          cover_url: data.cover_url || null,
          sun_sign,
          moon_sign,
          bio: data.bio || null,
          preferred_sign: data.preferred_sign || null,
          favorite_signs: data.favorite_signs,
          city: data.city || null,
          birth_date: data.birth_date || null,
          birth_time: data.birth_time_status === "unknown" ? null : (data.birth_time || null),
          birth_time_status: data.birth_time_status || "unknown",
          birth_place_label: data.birth_place_label || null,
          birth_city: data.birth_city || null,
          birth_region: data.birth_region || null,
          birth_country: data.birth_country || null,
          birth_country_code: data.birth_country_code?.toUpperCase() || null,
          birth_timezone: data.birth_timezone || null,
          birth_latitude: data.birth_latitude,
          birth_longitude: data.birth_longitude,
        }),
        updatePrivacySettings(user.id, {
          show_sun_sign: data.show_sun_sign,
          show_moon_sign: data.show_moon_sign,
          show_favorite_signs: data.show_favorite_signs,
        })
      ]);

      toast.success("Perfil astral guardado.");
    } catch {
      toast.error("No pudimos guardar. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <AccountShell title="Completa tu perfil astral" description="Cargando perfil...">
        <p className="text-ink-soft">Cargando…</p>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      title="Completa tu perfil astral"
      description="Edita tu identidad pública, configuraciones de privacidad y datos natales privados."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-10">
          
          {/* SECCIÓN: Tu Identidad Pública */}
          <section className="space-y-6">
            <h3 className="text-lg font-medium">Tu perfil público</h3>
            <p className="text-sm text-ink-muted">Esta información será visible en tu perfil social.</p>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <ImageUpload
                      userId={user.id}
                      type="avatar"
                      currentUrl={field.value}
                      onUploadSuccess={(url) => field.onChange(url)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cover_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portada</FormLabel>
                    <ImageUpload
                      userId={user.id}
                      type="cover"
                      currentUrl={field.value}
                      onUploadSuccess={(url) => field.onChange(url)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ej. daniel_astral" />
                  </FormControl>
                  <FormDescription>Único y en minúsculas (ej: mi_usuario)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre visible</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cómo quieres que te llamen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía corta</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} maxLength={400} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad actual (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Madrid" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* SECCIÓN: Tu Identidad Astral */}
          <section className="space-y-6">
            <h3 className="text-lg font-medium">Tu identidad astral</h3>
            <p className="text-sm text-ink-muted">Tus signos y afinidades.</p>
            
            <FormField
              control={form.control}
              name="preferred_sign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signo preferido</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu signo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zodiacSigns.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>El signo con el que más te identificas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favorite_signs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signos Favoritos (Máximo 3)</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      value={field.value}
                      onValueChange={(val) => {
                        if (val.length <= 3) field.onChange(val);
                      }}
                      className="flex-wrap justify-start gap-2"
                    >
                      {zodiacSigns.map((s) => (
                        <ToggleGroupItem
                          key={s.slug}
                          value={s.slug}
                          className="rounded-full px-4 py-1 border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {s.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* SECCIÓN: Privacidad */}
          <section className="space-y-6">
            <h3 className="text-lg font-medium">Privacidad del Perfil Público</h3>
            <p className="text-sm text-ink-muted">Controla qué información astral muestras en tu perfil público.</p>

            <FormField
              control={form.control}
              name="show_sun_sign"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Signo Solar</FormLabel>
                    <FormDescription>Tu signo solar aparecerá en tu perfil.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_moon_sign"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Signo Lunar</FormLabel>
                    <FormDescription>Tu signo lunar aparecerá en tu perfil (si tienes hora de nacimiento).</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_favorite_signs"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Signos Favoritos</FormLabel>
                    <FormDescription>Tus signos favoritos aparecerán en tu perfil.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          {/* SECCIÓN: Datos Natales (Privados) */}
          <section className="space-y-6 rounded-[var(--radius-card)] border border-line bg-warm-white p-6 shadow-card">
            <h3 className="text-lg font-medium">Datos Natales Privados</h3>
            <p className="text-sm text-ink-muted">Estos datos <strong>nunca</strong> son públicos. Se usan exclusivamente para calcular tu carta astral (Signo Solar, Lunar, etc.).</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_time_status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Hora de nacimiento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="exact" />
                          </FormControl>
                          <FormLabel className="font-normal">Exacta</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="approximate" />
                          </FormControl>
                          <FormLabel className="font-normal">Aproximada</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="unknown" />
                          </FormControl>
                          <FormLabel className="font-normal">Desconocida</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("birth_time_status") !== "unknown" && (
              <FormField
                control={form.control}
                name="birth_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora exacta o aproximada</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="birth_place_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar de nacimiento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Busca y selecciona tu ciudad de nacimiento.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="birth_city" render={({ field }) => (
                <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="birth_region" render={({ field }) => (
                <FormItem><FormLabel>Región</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="birth_country" render={({ field }) => (
                <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <FormField control={form.control} name="birth_country_code" render={({ field }) => (
                <FormItem><FormLabel>Cód. País</FormLabel><FormControl><Input {...field} value={field.value || ""} maxLength={2} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="birth_timezone" render={({ field }) => (
                <FormItem><FormLabel>Zona horaria</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="birth_latitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="birth_longitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Form>
    </AccountShell>
  );
}
