import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL ?? "https://creovision.io").replace(/\/$/, "");
const corePaths = [
  "/",
  "/horoscopo",
  "/horoscopo/hoy",
  "/horoscopo/semana",
  "/horoscopo/mes",
  "/tarot",
  "/tarot/carta-del-dia",
  "/tarot/si-o-no",
  "/tarot/tres-cartas",
  "/tarot/cartas",
  "/astrologia",
  "/compatibilidad",
  "/luna",
  "/luna/hoy",
  "/luna/calendario",
  "/luna/fases",
  "/guias",
  "/metodo",
  "/nosotros",
];

const zodiacSlugs = [
  "aries",
  "tauro",
  "geminis",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis",
];

const paths = [...corePaths, ...zodiacSlugs.map((slug) => `/horoscopo/${slug}`)];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(resolve("public/sitemap.xml"), xml, "utf8");
console.log(`Sitemap generado: ${paths.length} URLs en public/sitemap.xml`);
