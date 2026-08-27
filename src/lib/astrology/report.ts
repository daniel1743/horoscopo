import { formatDegree } from "@/services/astrology.service";
import type { NatalChart } from "@/types/astrology";
import type { SynastrySnapshot } from "@/types/synastry";
import type { TransitSnapshot } from "@/types/transits";

function reportHeader(title: string, subtitle: string): string[] {
  return [
    `# ${title}`,
    "",
    subtitle,
    "Este informe se generó localmente a partir de una lectura simbólica de referencia.",
    "No constituye diagnóstico, predicción determinista ni asesoramiento profesional.",
    "",
  ];
}

function natalLines(chart: NatalChart): string[] {
  return [
    "## Big Three",
    `- Sol: ${chart.summary.bigThree.sun.sign.label} (${formatDegree(chart.summary.bigThree.sun.degreeInSign)})`,
    `- Luna: ${chart.summary.bigThree.moon.sign.label} (${formatDegree(chart.summary.bigThree.moon.degreeInSign)})`,
    `- Ascendente: ${chart.summary.bigThree.ascendant.sign.label} (${formatDegree(chart.summary.bigThree.ascendant.degreeInSign)})`,
    "",
    "## Dominantes descriptivos",
    `- Elemento más repetido: ${chart.summary.dominantElement.label} (${chart.summary.dominantElement.count} de 11 puntos)`,
    `- Modalidad más repetida: ${chart.summary.dominantModality.label} (${chart.summary.dominantModality.count} de 11 puntos)`,
    `- Signo más repetido: ${chart.summary.dominantSign.label} (${chart.summary.dominantSign.count} de 11 puntos)`,
    "",
    "## Placements",
    ...chart.placements.map(
      (placement) =>
        `- ${placement.label}: ${placement.sign.label}, ${formatDegree(placement.degreeInSign)}, casa ${placement.house ?? "no asignada"}`,
    ),
    "",
    "## Ángulos",
    ...chart.angles.map(
      (angle) => `- ${angle.label}: ${angle.sign.label}, ${formatDegree(angle.degreeInSign)}`,
    ),
    "",
    "## Aspectos mayores",
    ...(chart.aspects.length > 0
      ? chart.aspects.map(
          (aspect) =>
            `- ${aspect.label}: ${aspect.firstLabel} · ${aspect.secondLabel}; orbe ${aspect.orb.toFixed(1)}°`,
        )
      : ["- No se formaron aspectos dentro de los orbes configurados."]),
  ];
}

export function buildNatalChartReport(chart: NatalChart): string {
  return [
    ...reportHeader(
      "Carta natal de referencia",
      `Fecha UTC calculada: ${chart.meta.dateTimeIso} · Zona horaria: ${chart.meta.timezone}`,
    ),
    ...natalLines(chart),
    "",
    "## Método y límites",
    `Coordenadas utilizadas: ${chart.meta.latitude.toFixed(4)}, ${chart.meta.longitude.toFixed(4)}.`,
    ...chart.meta.limitations.map((limitation) => `- ${limitation}`),
  ].join("\n");
}

export function buildTransitReport(snapshot: TransitSnapshot): string {
  return [
    ...reportHeader(
      "Tránsitos astrológicos de referencia",
      `Instante observado: ${snapshot.targetDateIso}`,
    ),
    "## Posiciones",
    ...snapshot.transits.map(
      (transit) =>
        `- ${transit.label}: ${transit.sign.label}, ${formatDegree(transit.degreeInSign)} · ${transit.speedDegreesPerDay.toFixed(2)}°/día${transit.isRetrograde ? " · retrógrado" : ""}`,
    ),
    "",
    "## Contactos con la carta natal",
    ...(snapshot.aspects.length > 0
      ? snapshot.aspects.map(
          (aspect) =>
            `- ${aspect.label}: ${aspect.firstLabel} · ${aspect.secondLabel}; orbe ${aspect.orb.toFixed(1)}°`,
        )
      : ["- No se formaron aspectos mayores dentro de los orbes configurados."]),
    "",
    "## Método y límites",
    ...snapshot.limitations.map((limitation) => `- ${limitation}`),
  ].join("\n");
}

export function buildSynastryReport(snapshot: SynastrySnapshot): string {
  return [
    ...reportHeader(
      "Sinastría de referencia",
      "Comparación local de dos cartas; los datos de ambas personas se mantuvieron en memoria.",
    ),
    "## Puntos principales",
    `- Persona A — Sol: ${snapshot.first.summary.bigThree.sun.sign.label}; Ascendente: ${snapshot.first.ascendant.sign.label}`,
    `- Persona B — Sol: ${snapshot.second.summary.bigThree.sun.sign.label}; Ascendente: ${snapshot.second.ascendant.sign.label}`,
    "",
    "## Contactos cruzados",
    ...(snapshot.aspects.length > 0
      ? snapshot.aspects.map(
          (aspect) =>
            `- ${aspect.label}: ${aspect.firstLabel} · ${aspect.secondLabel}; orbe ${aspect.orb.toFixed(1)}°`,
        )
      : ["- No se formaron aspectos mayores dentro de los orbes configurados."]),
    "",
    "## Método y límites",
    ...snapshot.limitations.map((limitation) => `- ${limitation}`),
  ].join("\n");
}
