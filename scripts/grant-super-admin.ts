/**
 * Script server-only para crear el primer super_admin.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     bunx tsx scripts/grant-super-admin.ts <user_email>
 *
 * Reglas:
 *  - NO usa emails hard-coded. El correo se pasa por argumento.
 *  - NO ejecuta en el navegador (usa SERVICE_ROLE_KEY).
 *  - Idempotente: si el rol ya existe, no falla.
 *  - Registra la acción en admin_audit_log.
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: bunx tsx scripts/grant-super-admin.ts <email>");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Buscar usuario por email (paginado; primer match).
  const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("Error listando usuarios:", listErr.message);
    process.exit(1);
  }
  const user = usersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No se encontró usuario con email ${email}.`);
    process.exit(1);
  }

  // Insertar rol (idempotente por unique(user_id, role)).
  const { error: insertErr } = await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "super_admin", granted_by: null })
    .select()
    .maybeSingle();

  if (insertErr && !/duplicate|unique/i.test(insertErr.message)) {
    console.error("Error asignando rol:", insertErr.message);
    process.exit(1);
  }

  await admin.from("admin_audit_log").insert({
    actor_id: null,
    actor_role: "bootstrap_script",
    action: "grant_role",
    resource_type: "user",
    resource_id: user.id,
    status: "success",
    metadata: { role: "super_admin", email_hint: email.split("@")[1] ?? "" },
  });

  console.log(`✓ ${email} es ahora super_admin (user_id=${user.id}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
