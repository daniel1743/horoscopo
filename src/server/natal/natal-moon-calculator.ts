import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
import type { ZodiacSignKey } from "@/data/zodiac-signs";

export interface MoonPosition {
  longitude: number;
  sign: ZodiacSignKey;
  degreeInSign: number;
  speedDegreesPerDay: number;
  calculatedAt: string;
}

export interface NatalMoonResult {
  moon: MoonPosition;
  confidence: "high" | "dual"; // 'high' if exact or sign didn't change, 'dual' if exact time unknown and sign changed
  alternativeSign?: ZodiacSignKey; // if confidence is 'dual', this is the other possible sign
}

export function getCurrentMoonPosition(date: Date = new Date()): MoonPosition {
  const pos = astronomyPlanetaryEngine.calculatePosition("moon", date);
  return {
    longitude: pos.longitude,
    sign: pos.sign,
    degreeInSign: pos.degreeInSign,
    speedDegreesPerDay: pos.speedDegreesPerDay,
    calculatedAt: date.toISOString(),
  };
}

/**
 * Calcula la posición de la Luna natal basándose en fecha, hora (opcional) y zona horaria.
 * @param birthDate Fecha en formato YYYY-MM-DD
 * @param birthTime Hora en formato HH:mm (opcional)
 * @param timezoneOffset Horas de diferencia con UTC (ej: -3) o zona horaria
 */
export function calculateNatalMoon(
  birthDate: string,
  birthTime?: string,
  timezoneOffset: number = 0
): NatalMoonResult {
  if (birthTime) {
    // Si sabemos la hora, calculamos con exactitud
    const [hours, minutes] = birthTime.split(":").map(Number);
    
    // Configurar la hora local asumiendo que el input era local
    // Es más seguro instanciar en UTC directamente restando el offset al tiempo local
    const exactUtcHour = hours - timezoneOffset;
    
    const utcDate = new Date();
    utcDate.setUTCFullYear(parseInt(birthDate.substring(0, 4)), parseInt(birthDate.substring(5, 7)) - 1, parseInt(birthDate.substring(8, 10)));
    utcDate.setUTCHours(Math.floor(exactUtcHour));
    utcDate.setUTCMinutes(minutes + (exactUtcHour % 1) * 60);
    utcDate.setUTCSeconds(0);
    utcDate.setUTCMilliseconds(0);

    const pos = getCurrentMoonPosition(utcDate);
    return {
      moon: pos,
      confidence: "high"
    };
  }

  // Si no sabemos la hora, calculamos a las 00:00 y a las 23:59 del lugar de nacimiento
  const dateStart = new Date();
  dateStart.setUTCFullYear(parseInt(birthDate.substring(0, 4)), parseInt(birthDate.substring(5, 7)) - 1, parseInt(birthDate.substring(8, 10)));
  dateStart.setUTCHours(0 - timezoneOffset); // 00:00 local a UTC
  dateStart.setUTCMinutes(0);
  
  const dateEnd = new Date(dateStart);
  dateEnd.setUTCHours(dateStart.getUTCHours() + 23);
  dateEnd.setUTCMinutes(59);

  const posStart = getCurrentMoonPosition(dateStart);
  const posEnd = getCurrentMoonPosition(dateEnd);

  if (posStart.sign === posEnd.sign) {
    // El signo no cambió durante el día, confiamos en el cálculo de las 12:00 mediodía
    const dateMid = new Date(dateStart);
    dateMid.setUTCHours(dateStart.getUTCHours() + 12);
    return {
      moon: getCurrentMoonPosition(dateMid),
      confidence: "high"
    };
  } else {
    // El signo cambia durante el día. Devolver el signo en el que estuvo más horas, pero advertir dualidad
    // Para simplificar, devolvemos el de las 12:00 como principal, pero marcamos dual.
    const dateMid = new Date(dateStart);
    dateMid.setUTCHours(dateStart.getUTCHours() + 12);
    const midPos = getCurrentMoonPosition(dateMid);
    
    return {
      moon: midPos,
      confidence: "dual",
      alternativeSign: midPos.sign === posStart.sign ? posEnd.sign : posStart.sign
    };
  }
}
