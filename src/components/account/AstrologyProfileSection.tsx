import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import {
  AstrologyPersistenceError,
  clearPersistedAstrologyBirthData,
  fetchPersistedAstrologyBirthData,
  savePersistedAstrologyBirthData,
  type PersistedAstrologyBirthData,
} from "@/lib/astrology/profile-repository";
import { routes } from "@/config/routes";
import type { BirthData } from "@/types/astrology";

interface Draft {
  birthDate: string;
  birthTime: string;
  timezone: string;
  locationLabel: string;
  latitude: string;
  longitude: string;
}

type LoadState = "loading" | "ready" | "unavailable" | "error";

const EMPTY_DRAFT: Draft = {
  birthDate: "",
  birthTime: "",
  timezone: "UTC",
  locationLabel: "",
  latitude: "",
  longitude: "",
};

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function draftFromPersisted(data: PersistedAstrologyBirthData | null): Draft {
  if (!data) return { ...EMPTY_DRAFT, timezone: browserTimezone() };
  return {
    birthDate: data.birthDate ?? "",
    birthTime: data.birthTime ?? "",
    timezone: data.timezone ?? browserTimezone(),
    locationLabel: data.locationLabel ?? "",
    latitude: data.latitude == null ? "" : String(data.latitude),
    longitude: data.longitude == null ? "" : String(data.longitude),
  };
}

function parseDraft(draft: Draft): BirthData {
  if (!draft.birthDate) throw new Error("Introduce tu fecha de nacimiento.");
  if (!draft.timezone.trim()) throw new Error("Introduce una zona horaria IANA.");

  try {
    Intl.DateTimeFormat("en-US", { timeZone: draft.timezone.trim() }).format();
  } catch {
    throw new Error("La zona horaria no parece un identificador IANA válido.");
  }

  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("Introduce una latitud entre -90 y 90.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Introduce una longitud entre -180 y 180.");
  }

  return {
    birthDate: draft.birthDate,
    birthTime: draft.birthTime || undefined,
    timezone: draft.timezone.trim(),
    latitude,
    longitude,
    locationLabel: draft.locationLabel.trim() || undefined,
  };
}

function persistenceMessage(error: unknown): string {
  if (error instanceof AstrologyPersistenceError) return error.message;
  return "No pudimos completar esta operación de privacidad.";
}

export function AstrologyProfileSection() {
  const { user, loading: sessionLoading } = useSession();
  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    timezone: browserTimezone(),
  }));
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPersistedData, setHasPersistedData] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoadState("ready");
      setHasPersistedData(false);
      return;
    }

    let active = true;
    setLoadState("loading");
    setMessage(null);
    setError(null);
    fetchPersistedAstrologyBirthData(user.id)
      .then((data) => {
        if (!active) return;
        setDraft(draftFromPersisted(data));
        setHasPersistedData(Boolean(data));
        setLoadState("ready");
      })
      .catch((cause) => {
        if (!active) return;
        setLoadState(
          cause instanceof AstrologyPersistenceError && cause.status === "backend-unavailable"
            ? "unavailable"
            : "error",
        );
        setError(persistenceMessage(cause));
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, user]);

  const hasDraft = useMemo(
    () => Object.values(draft).some((value) => value.trim().length > 0),
    [draft],
  );

  function updateDraft(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setMessage(null);
    setError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Inicia sesión para guardar datos natales en tu perfil privado.");
      return;
    }

    let birthData: BirthData;
    try {
      birthData = parseDraft(draft);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Revisa los datos natales.");
      setMessage(null);
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await savePersistedAstrologyBirthData(user.id, birthData);
      setDraft(draftFromPersisted(saved));
      setHasPersistedData(true);
      setLoadState("ready");
      setMessage(
        "Datos natales guardados en tu perfil privado. Los resultados se siguen calculando localmente.",
      );
    } catch (cause) {
      setError(persistenceMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!user || !hasPersistedData || busy) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("¿Eliminar los datos natales guardados de tu perfil privado?")
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await clearPersistedAstrologyBirthData(user.id);
      setDraft({ ...EMPTY_DRAFT, timezone: browserTimezone() });
      setHasPersistedData(false);
      setLoadState("ready");
      setMessage(
        "Los datos natales guardados fueron eliminados. No se eliminaron tus resultados locales ni el resto de tu perfil.",
      );
    } catch (cause) {
      setError(persistenceMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="astrology-profile-title"
      className="mt-6 rounded-[var(--radius-card)] border border-line bg-warm-white p-5 md:p-6"
    >
      <div>
        <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
          Privacidad y precarga
        </p>
        <h2 id="astrology-profile-title" className="mt-2 font-display text-[23px] text-ink">
          Datos natales guardados
        </h2>
        <p className="mt-2 max-w-[70ch] font-body text-[13px] leading-6 text-ink-soft">
          Estos son datos que introduces tú para precargar las herramientas de Astrología. Esta
          sección guarda datos de entrada, no resultados calculados, y no los publica en tu perfil
          ni en la Comunidad.
        </p>
      </div>

      {sessionLoading || loadState === "loading" ? (
        <p className="mt-5 font-body text-[13px] text-ink-soft">Comprobando tus datos privados…</p>
      ) : !user ? (
        <p className="mt-5 font-body text-[13px] text-ink-soft">
          Inicia sesión para guardar y recuperar datos natales. Puedes seguir usando las
          herramientas locales sin guardar nada.{" "}
          <Link
            to={routes.signIn}
            search={{
              redirect: typeof window !== "undefined" ? window.location.pathname : "/",
              mode: "signin",
            }}
            className="text-brand underline"
          >
            Iniciar sesión
          </Link>
        </p>
      ) : (
        <>
          {loadState === "unavailable" && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 font-body text-[13px] text-ink-soft"
            >
              El esquema de persistencia natal todavía no está disponible. Puedes revisar los
              campos, pero no se afirmará que fueron guardados hasta que Supabase responda.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 font-body text-[13px] text-danger"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 font-body text-[13px] text-ink-soft"
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSave} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-date">Fecha de nacimiento</Label>
                <Input
                  id="profile-birth-date"
                  type="date"
                  value={draft.birthDate}
                  onChange={(event) => updateDraft("birthDate", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-time">Hora de nacimiento (opcional)</Label>
                <Input
                  id="profile-birth-time"
                  type="time"
                  value={draft.birthTime}
                  onChange={(event) => updateDraft("birthTime", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-timezone">Zona horaria IANA</Label>
                <Input
                  id="profile-birth-timezone"
                  value={draft.timezone}
                  onChange={(event) => updateDraft("timezone", event.target.value)}
                  placeholder="America/Bogota"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-place">Lugar de referencia (opcional)</Label>
                <Input
                  id="profile-birth-place"
                  value={draft.locationLabel}
                  onChange={(event) => updateDraft("locationLabel", event.target.value)}
                  maxLength={160}
                  placeholder="Bogotá, Colombia"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-latitude">Latitud</Label>
                <Input
                  id="profile-birth-latitude"
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  inputMode="decimal"
                  value={draft.latitude}
                  onChange={(event) => updateDraft("latitude", event.target.value)}
                  placeholder="4.7110"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-birth-longitude">Longitud</Label>
                <Input
                  id="profile-birth-longitude"
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  inputMode="decimal"
                  value={draft.longitude}
                  onChange={(event) => updateDraft("longitude", event.target.value)}
                  placeholder="-74.0721"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={busy}>
                {busy ? "Guardando…" : "Guardar datos natales"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={busy || !hasPersistedData}
              >
                Eliminar datos guardados
              </Button>
            </div>
            <p className="font-body text-[12px] leading-5 text-ink-muted">
              Estado:{" "}
              {hasPersistedData
                ? "hay datos guardados para precargar"
                : "no hay datos natales confirmados como guardados"}
              . Los resultados de Carta natal, Ascendente y Signo lunar no se escriben en esta
              tabla.
            </p>
          </form>
        </>
      )}
    </section>
  );
}
