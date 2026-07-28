import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportAccountFn, deleteAccountFn } from "@/lib/account/account.functions";
import { routes } from "@/config/routes";
import { toast } from "sonner";

export function AccountSettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const exportAccount = useServerFn(exportAccountFn);
  const deleteAccount = useServerFn(deleteAccountFn);

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success("Contraseña actualizada");
  };

  const handleExport = async () => {
    try {
      const res = (await exportAccount({ data: undefined as never })) as { payload: string };
      const blob = new Blob([res.payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proyecto-astral-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportación descargada");
    } catch (err) {
      console.error(err);
      toast.error("No pudimos generar la exportación");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount({ data: undefined as never });
      await supabase.auth.signOut();
      toast.success("Cuenta eliminada");
      navigate({ to: routes.home, replace: true });
    } catch (err) {
      console.error(err);
      toast.error("No pudimos eliminar la cuenta. Contacta soporte.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: routes.home, replace: true });
  };

  return (
    <AccountShell title="Configuración" description="Contraseña, exportar y eliminar tu cuenta.">
      <section className="space-y-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Cuenta</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Sesión iniciada como <strong>{user?.email}</strong>
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>

        <div className="border-t border-line pt-6">
          <h3 className="font-display text-lg font-semibold text-ink">Cambiar contraseña</h3>
          <form onSubmit={changePassword} className="mt-3 max-w-sm space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-pass">Nueva contraseña</Label>
              <Input
                id="new-pass"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando…" : "Actualizar contraseña"}
            </Button>
          </form>
        </div>

        <div className="border-t border-line pt-6">
          <h3 className="font-display text-lg font-semibold text-ink">Tus datos</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Descarga una copia completa de tu perfil, favoritos, lecturas, historial y memorias.
          </p>
          <Button variant="outline" className="mt-3" onClick={handleExport}>
            Exportar mis datos (JSON)
          </Button>
        </div>

        <div className="border-t border-line pt-6">
          <h3 className="font-display text-lg font-semibold text-destructive">Eliminar cuenta</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.
          </p>
          <Button variant="destructive" className="mt-3" onClick={() => setConfirmOpen(true)}>
            Eliminar cuenta
          </Button>
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán tu perfil, favoritos, lecturas guardadas, historial, memoria y
              conversaciones. Esta acción es permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountShell>
  );
}
