import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL ?? "https://www.creovision.io").replace(/\/$/, "");
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
  "/astrologia/carta-natal",
  "/astrologia/ascendente",
  "/astrologia/signo-lunar",
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

const guideCategorySlugs = [
  "astrologia",
  "tarot",
  "luna",
  "compatibilidad",
  "horoscopo",
  "editorial",
];

const guideSlugs = [
  "como-leer-una-carta-natal-sin-convertirla-en-una-sentencia",
  "ascendente-signo-lunar-y-sol-tres-capas-para-conocerte-mejor",
  "como-hacer-una-pregunta-util-antes-de-sacar-una-carta",
  "carta-al-derecho-y-carta-invertida-leer-matices-no-condenas",
  "las-ocho-fases-de-la-luna-que-observamos-realmente-en-el-cielo",
  "calendario-lunar-como-usar-fechas-astronomicas-sin-atribuir-causalidades",
  "compatibilidad-entre-signos-pasar-del-veredicto-a-la-conversacion",
  "elementos-ritmos-y-acuerdos-una-lectura-practica-de-dos-signos",
  "como-leer-un-horoscopo-diario-con-criterio-y-contexto",
  "de-la-prediccion-a-la-reflexion-que-hace-util-una-lectura-simbolica",
  "que-significa-leer-simbolos-con-responsabilidad",
  "como-distinguir-un-dato-astronomico-de-una-interpretacion",
];

const paths = [
  ...corePaths,
  ...zodiacSlugs.map((slug) => `/horoscopo/${slug}`),
  ...guideCategorySlugs.map((slug) => `/temas/${slug}`),
  ...guideSlugs.map((slug) => `/guias/${slug}`),
  "/autores/equipo-editorial",
];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(resolve("public/sitemap.xml"), xml, "utf8");
console.log(`Sitemap generado: ${paths.length} URLs en public/sitemap.xml`);
