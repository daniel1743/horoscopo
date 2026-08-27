#!/usr/bin/env node

const baseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!baseUrl || !anonKey) {
  console.error("Faltan SUPABASE_URL/VITE_SUPABASE_URL y una clave pública de Supabase.");
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

const checks = [
  {
    label: "tabla community_posts",
    request: () =>
      fetch(`${normalizedBaseUrl}/rest/v1/community_posts?select=id&limit=1`, { headers }),
  },
  {
    label: "RPC list_public_community_posts",
    request: () =>
      fetch(`${normalizedBaseUrl}/rest/v1/rpc/list_public_community_posts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ p_limit: 1 }),
      }),
  },
  {
    label: "RPC list_public_community_reposts",
    request: () =>
      fetch(`${normalizedBaseUrl}/rest/v1/rpc/list_public_community_reposts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ p_limit: 1 }),
      }),
  },
  {
    label: "RPC get_public_profile",
    request: () =>
      fetch(`${normalizedBaseUrl}/rest/v1/rpc/get_public_profile`, {
        method: "POST",
        headers,
        body: JSON.stringify({ p_username: "__social_schema_probe__" }),
      }),
  },
];

let failed = false;
for (const check of checks) {
  try {
    const response = await check.request();
    const body = await response.text();
    if (response.ok) {
      console.log(`OK   ${check.label}`);
    } else {
      failed = true;
      console.error(`FAIL ${check.label} (${response.status}): ${body.slice(0, 180)}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${check.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  console.error(
    "El backend social no está listo o no se pudo alcanzar. No se realizaron cambios remotos.",
  );
  process.exit(1);
}

console.log("Backend social accesible: tablas y RPC principales responden correctamente.");
