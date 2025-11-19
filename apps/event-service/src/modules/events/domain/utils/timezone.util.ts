// timezone.util.ts
import { DateTime } from 'luxon';

const BOGOTA_ZONE = 'America/Bogota';

/**
 * INPUTS: Use this when receiving a date string from the DTO.
 * It forces the string to be interpreted as Bogota time, then converts to UTC Date.
 * 
 * Example: Input "2025-11-18T23:59:00" -> Becomes UTC timestamp for 4:59 AM next day
 */
export function parseBogotaToUTC(isoString: string): Date {
  // If the string has a 'Z' at the end, remove it to ensure we treat it as local
  const cleanString = isoString.endsWith('Z') ? isoString.slice(0, -1) : isoString;
  
  return DateTime.fromISO(cleanString, { zone: BOGOTA_ZONE }).toJSDate();
}

/**
 * COMPARISONS: Use this for logic checks.
 * Since our DB stores Real UTC, we just need the current Real UTC.
 */
export function getNowUTC(): Date {
  return new Date();
}