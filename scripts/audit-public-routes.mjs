const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const signs = [
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

const moonPhaseSlugs = [
  "luna-nueva",
  "luna-creciente",
  "cuarto-creciente",
  "gibosa-creciente",
  "luna-llena",
  "gibosa-menguante",
  "cuarto-menguante",
  "luna-menguante",
];

function canonicalPairs() {
  const pairs = [];
  for (let i = 0; i < signs.length; i += 1) {
    for (let j = i; j < signs.length; j += 1) {
      pairs.push([signs[i], signs[j]]);
    }
  }
  return pairs;
}

function hasBadMarker(html) {
  return [
    "Combinación no válida",
    "Fase no encontrada",
    "No pudimos cargar la compatibilidad",
    "This page didn't load",
    "Page not found",
  ].some((marker) => html.includes(marker));
}

async function fetchRoute(path, { redirect = "follow" } = {}) {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url, { redirect });
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] ?? "";
    const description =
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? "";
    return {
      url,
      path,
      http: response.status,
      redirected: response.redirected,
      location: response.headers.get("location") ?? "",
      h1: /<h1[\s>]/i.test(html),
      title: title.length > 0,
      description: description.length > 0,
      badMarker: hasBadMarker(html),
      oldTarotCta: html.includes("Realizar tirada"),
      tarotFanSignal: html.includes("Elige 3 cartas") || html.includes("Barajando las cartas"),
      bytes: html.length,
    };
  } catch (error) {
    return {
      url,
      path,
      http: 0,
      redirected: false,
      location: "",
      h1: false,
      title: false,
      description: false,
      badMarker: true,
      oldTarotCta: false,
      tarotFanSignal: false,
      bytes: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const checks = [];

checks.push(
  {
    group: "priority",
    path: "/tarot/tres-cartas",
    expect: (r) => r.http === 200 && !r.oldTarotCta,
  },
  {
    group: "priority",
    path: "/compatibilidad/geminis/sagitario",
    expect: (r) => r.http === 200 && !r.badMarker,
  },
  {
    group: "priority",
    path: "/compatibilidad/cancer/capricornio",
    expect: (r) => r.http === 200 && !r.badMarker,
  },
  { group: "priority", path: "/luna", expect: (r) => r.http === 200 && !r.badMarker },
  {
    group: "priority",
    path: "/luna/fases/luna-creciente",
    expect: (r) => r.http === 200 && !r.badMarker,
  },
);

for (const [a, b] of canonicalPairs()) {
  checks.push({
    group: "compat-canonical",
    path: `/compatibilidad/${a}/${b}`,
    expect: (r) => r.http === 200 && !r.badMarker,
  });
  if (a !== b) {
    checks.push({
      group: "compat-reversed",
      path: `/compatibilidad/${b}/${a}`,
      options: { redirect: "manual" },
      expect: (r) =>
        [301, 302, 307, 308].includes(r.http) && r.location.includes(`/compatibilidad/${a}/${b}`),
    });
  }
}

for (const slug of moonPhaseSlugs) {
  checks.push({
    group: "moon-phase",
    path: `/luna/fases/${slug}`,
    expect: (r) => r.http === 200 && !r.badMarker,
  });
}

checks.push({
  group: "compat-invalid",
  path: "/compatibilidad/signo-inexistente/geminis",
  options: { redirect: "manual" },
  expect: (r) => r.http === 404,
});

const rows = [];
for (const check of checks) {
  const result = await fetchRoute(check.path, check.options);
  const pass = check.expect(result);
  rows.push({
    group: check.group,
    url: result.url,
    http: result.http,
    render: result.badMarker ? "bad-marker" : "ok",
    seo: result.title && result.description ? "ok" : "missing",
    canonical: result.location || "-",
    status: pass ? "PASS" : "FAIL",
    cause: pass ? "-" : result.error || JSON.stringify(result),
  });
}

const failures = rows.filter((row) => row.status === "FAIL");
console.table(rows);
console.log(JSON.stringify({ baseUrl, total: rows.length, failures: failures.length }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
