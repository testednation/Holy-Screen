import {
  LocationConfig,
  ZmanimData,
  ZmanItem,
  ShitaOpinion,
  ParshaData,
  LimudItem,
  AliyahItem,
  HebrewCalendarCell,
  HebrewMonthGridData,
  DafYomiData,
  MizrachMetrics,
  JewishHolidayEvent,
} from '../types/dashboard';

export const PRESET_LOCATIONS: LocationConfig[] = [
  {
    id: 'brooklyn-ch',
    name: 'Brooklyn (Crown Heights)',
    hebrewName: 'קראון הייטס, ניו יורק',
    region: 'NY, United States',
    latitude: 40.6689,
    longitude: -73.9428,
    tzid: 'America/New_York',
    candleLightingMinutes: 18,
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    hebrewName: 'ירושלים תובב״א',
    region: 'Israel',
    latitude: 31.7683,
    longitude: 35.2137,
    tzid: 'Asia/Jerusalem',
    candleLightingMinutes: 40,
  },
  {
    id: 'bnei-brak',
    name: 'Bnei Brak / Tel Aviv',
    hebrewName: 'בני ברק · גוש דן',
    region: 'Israel',
    latitude: 32.084,
    longitude: 34.8352,
    tzid: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
  },
  {
    id: 'lakewood',
    name: 'Lakewood',
    hebrewName: 'לייקווד, ניו ג׳רזי',
    region: 'NJ, United States',
    latitude: 40.0979,
    longitude: -74.2176,
    tzid: 'America/New_York',
    candleLightingMinutes: 18,
  },
  {
    id: 'monsey',
    name: 'Monsey',
    hebrewName: 'מונסי, ניו יורק',
    region: 'NY, United States',
    latitude: 41.1112,
    longitude: -74.0685,
    tzid: 'America/New_York',
    candleLightingMinutes: 18,
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles (Pico-Robertson)',
    hebrewName: 'לוס אנג׳לס',
    region: 'CA, United States',
    latitude: 34.0537,
    longitude: -118.3848,
    tzid: 'America/Los_Angeles',
    candleLightingMinutes: 18,
  },
  {
    id: 'miami-beach',
    name: 'Miami Beach / Bal Harbour',
    hebrewName: 'מיאמי ביץ׳',
    region: 'FL, United States',
    latitude: 25.8876,
    longitude: -80.1312,
    tzid: 'America/New_York',
    candleLightingMinutes: 18,
  },
  {
    id: 'chicago',
    name: 'Chicago (West Rogers Park)',
    hebrewName: 'שיקגו',
    region: 'IL, United States',
    latitude: 42.0031,
    longitude: -87.6952,
    tzid: 'America/Chicago',
    candleLightingMinutes: 18,
  },
  {
    id: 'toronto',
    name: 'Toronto (Bathurst)',
    hebrewName: 'טורונטו',
    region: 'ON, Canada',
    latitude: 43.722,
    longitude: -79.4317,
    tzid: 'America/Toronto',
    candleLightingMinutes: 18,
  },
  {
    id: 'london',
    name: 'London (Golders Green / Stamford Hill)',
    hebrewName: 'לונדון',
    region: 'United Kingdom',
    latitude: 51.5723,
    longitude: -0.1945,
    tzid: 'Europe/London',
    candleLightingMinutes: 18,
  },
  {
    id: 'paris',
    name: 'Paris',
    hebrewName: 'פריז',
    region: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    tzid: 'Europe/Paris',
    candleLightingMinutes: 18,
  },
  {
    id: 'melbourne',
    name: 'Melbourne (Caulfield)',
    hebrewName: 'מלבורן',
    region: 'VIC, Australia',
    latitude: -37.8772,
    longitude: 145.0247,
    tzid: 'Australia/Melbourne',
    candleLightingMinutes: 18,
  },
];

const HEBREW_GEMATRIA_DAYS: Record<number, string> = {
  1: 'א׳',
  2: 'ב׳',
  3: 'ג׳',
  4: 'ד׳',
  5: 'ה׳',
  6: 'ו׳',
  7: 'ז׳',
  8: 'ח׳',
  9: 'ט׳',
  10: 'י׳',
  11: 'י״א',
  12: 'י״ב',
  13: 'י״ג',
  14: 'י״ד',
  15: 'ט״ו',
  16: 'ט״ז',
  17: 'י״ז',
  18: 'י״ח',
  19: 'י״ט',
  20: 'כ׳',
  21: 'כ״א',
  22: 'כ״ב',
  23: 'כ״ג',
  24: 'כ״ד',
  25: 'כ״ה',
  26: 'כ״ו',
  27: 'כ״ז',
  28: 'כ״ח',
  29: 'כ״ט',
  30: 'ל׳',
};

export function getHebrewDateStrings(date: Date): { en: string; he: string } {
  try {
    const enFmt = new Intl.DateTimeFormat('en-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const heFmt = new Intl.DateTimeFormat('he-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const partsHe = heFmt.formatToParts(date);
    const dayNum = parseInt(partsHe.find((p) => p.type === 'day')?.value || '1', 10);
    const monthHe = partsHe.find((p) => p.type === 'month')?.value || '';
    const dayGematria = HEBREW_GEMATRIA_DAYS[dayNum] || String(dayNum);

    const enRaw = enFmt.format(date).replace(/\s*AH$/, '');
    const heFormatted = `${dayGematria} ב${monthHe} תשפ״ז`;
    return {
      en: enRaw,
      he: heFormatted,
    };
  } catch {
    return {
      en: '21 Cheshvan 5787',
      he: 'כ״א בחשוון תשפ״ז',
    };
  }
}

interface ParsedHebrewParts {
  dayNum: number;
  monthEn: string;
  monthHe: string;
  yearEn: string;
}

const enHebFormatter = new Intl.DateTimeFormat('en-u-ca-hebrew', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const heHebFormatter = new Intl.DateTimeFormat('he-u-ca-hebrew', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function parseHebrewDateParts(date: Date): ParsedHebrewParts {
  try {
    const enParts = enHebFormatter.formatToParts(date);
    const heParts = heHebFormatter.formatToParts(date);
    const dayNum = parseInt(
      enParts.find((p) => p.type === 'day')?.value || '1',
      10
    );
    const monthEn = enParts.find((p) => p.type === 'month')?.value || 'Cheshvan';
    const yearEn = (enParts.find((p) => p.type === 'year')?.value || '5787').replace(
      /\s*AH$/,
      ''
    );
    const monthHe = heParts.find((p) => p.type === 'month')?.value || 'חשוון';
    return { dayNum, monthEn, monthHe, yearEn };
  } catch {
    return {
      dayNum: 21,
      monthEn: 'Cheshvan',
      monthHe: 'חשוון',
      yearEn: '5787',
    };
  }
}

function getSpecialJewishDayLabel(monthEn: string, dayNum: number): string | undefined {
  const m = monthEn.toLowerCase();
  if (dayNum === 1 || dayNum === 30) return 'Rosh Chodesh';
  if (m.includes('tishri') || m.includes('tishrei')) {
    if (dayNum === 1 || dayNum === 2) return 'Rosh Hashanah';
    if (dayNum === 3) return 'Tzom Gedaliah';
    if (dayNum === 10) return 'Yom Kippur';
    if (dayNum >= 15 && dayNum <= 21) return 'Sukkot';
    if (dayNum === 22) return 'Shemini Atzeret';
    if (dayNum === 23) return 'Simchat Torah';
  }
  if (m.includes('heshvan') || m.includes('cheshvan')) {
    if (dayNum === 7) return 'V’tein Tal U’Matar (IL)';
    if (dayNum === 20) return 'Chaf Cheshvan';
  }
  if (m.includes('kislev')) {
    if (dayNum === 19) return 'Yud-Tes Kislev';
    if (dayNum >= 25) return 'Chanukah';
  }
  if (m.includes('tevet')) {
    if (dayNum <= 2) return 'Chanukah';
    if (dayNum === 10) return 'Asarah B’Tevet';
  }
  if (m.includes('shevat') || m.includes('shvat')) {
    if (dayNum === 10) return 'Yud Shevat';
    if (dayNum === 15) return 'Tu BiShvat';
  }
  if (m.includes('adar')) {
    if (dayNum === 13) return 'Ta’anit Esther';
    if (dayNum === 14) return 'Purim';
    if (dayNum === 15) return 'Shushan Purim';
  }
  if (m.includes('nisan')) {
    if (dayNum === 11) return 'Yud-Alef Nisan';
    if (dayNum >= 15 && dayNum <= 22) return 'Pesach';
  }
  if (m.includes('iyar')) {
    if (dayNum === 14) return 'Pesach Sheni';
    if (dayNum === 18) return 'Lag BaOmer';
  }
  if (m.includes('sivan')) {
    if (dayNum === 6 || dayNum === 7) return 'Shavuot';
  }
  if (m.includes('tamuz') || m.includes('tammuz')) {
    if (dayNum === 3) return 'Gimmel Tammuz';
    if (dayNum === 17) return 'Shiva Asar B’Tammuz';
  }
  if (m.includes('av')) {
    if (dayNum === 9) return 'Tisha B’Av';
    if (dayNum === 15) return 'Tu B’Av';
  }
  if (m.includes('elul')) {
    if (dayNum === 18) return 'Chai Elul';
  }
  return undefined;
}

export function buildHebrewMonthGrid(
  monthAnchorDate: Date,
  selectedDate: Date
): HebrewMonthGridData {
  // Normalize to local noon to prevent DST boundary shifts
  const anchorNoon = new Date(
    monthAnchorDate.getFullYear(),
    monthAnchorDate.getMonth(),
    monthAnchorDate.getDate(),
    12,
    0,
    0
  );
  const anchorParts = parseHebrewDateParts(anchorNoon);

  // Step backward to find 1st of this Hebrew month
  let firstDay = new Date(anchorNoon);
  for (let i = 0; i < 32; i++) {
    const prev = new Date(firstDay.getTime() - 86400000);
    const prevParts = parseHebrewDateParts(prev);
    if (prevParts.monthEn !== anchorParts.monthEn) break;
    firstDay = prev;
  }

  // Step forward from firstDay to find the last day of this Hebrew month (29 or 30 days)
  let lastDay = new Date(firstDay);
  for (let i = 0; i < 32; i++) {
    const next = new Date(lastDay.getTime() + 86400000);
    const nextParts = parseHebrewDateParts(next);
    if (nextParts.monthEn !== anchorParts.monthEn) break;
    lastDay = next;
  }

  // Pad grid start back to Sunday (getDay() === 0)
  const startGridDate = new Date(
    firstDay.getTime() - firstDay.getDay() * 86400000
  );
  // Pad grid end forward to Saturday (getDay() === 6)
  const endGridDate = new Date(
    lastDay.getTime() + (6 - lastDay.getDay()) * 86400000
  );

  const todayYmd = formatDateYMD(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
  const selectedYmd = formatDateYMD(
    selectedDate,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const cells: HebrewCalendarCell[] = [];
  let cursor = new Date(startGridDate);
  let safety = 0;
  while (cursor.getTime() <= endGridDate.getTime() && safety < 49) {
    safety++;
    const cParts = parseHebrewDateParts(cursor);
    const ymd = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(cursor.getDate()).padStart(2, '0')}`;
    const isCurrentMonth = cParts.monthEn === anchorParts.monthEn;
    const isRoshChodesh = cParts.dayNum === 1 || cParts.dayNum === 30;

    cells.push({
      date: new Date(cursor),
      ymd,
      hebrewDayNum: cParts.dayNum,
      hebrewDayGematria: HEBREW_GEMATRIA_DAYS[cParts.dayNum] || String(cParts.dayNum),
      gregorianDayNum: cursor.getDate(),
      gregorianMonthShort: cursor.toLocaleDateString('en-US', { month: 'short' }),
      isCurrentHebrewMonth: isCurrentMonth,
      isToday: ymd === todayYmd,
      isSelected: ymd === selectedYmd,
      isShabbat: cursor.getDay() === 6,
      isRoshChodesh,
      specialLabel: getSpecialJewishDayLabel(cParts.monthEn, cParts.dayNum),
    });

    cursor = new Date(cursor.getTime() + 86400000);
  }

  const startGregMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
  const endGregMonth = lastDay.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const gregorianRangeLabel =
    startGregMonth === lastDay.toLocaleDateString('en-US', { month: 'short' })
      ? endGregMonth
      : `${startGregMonth} – ${endGregMonth}`;

  return {
    hebrewMonthNameEn: anchorParts.monthEn,
    hebrewMonthNameHe: anchorParts.monthHe,
    hebrewYearEn: anchorParts.yearEn,
    gregorianRangeLabel,
    firstDayOfHebrewMonth: firstDay,
    lastDayOfHebrewMonth: lastDay,
    cells,
  };
}

export function formatTimeInTz(date: Date, tzid: string, includeSeconds = false): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true,
      timeZone: tzid,
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });
  }
}

export function formatDateYMD(date: Date, tzid: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: tzid,
    }).formatToParts(date);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // ignore
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Deterministic NOAA Solar Equation for accurate Sunrise, Sunset, and Depression Angle Times
 */
function calculateSolarEvents(
  date: Date,
  latitude: number,
  longitude: number
): { sunrise: Date; sunset: Date; solarNoon: Date; dawn16_1: Date; dusk8_5: Date } {
  const startOfYear = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + 0.5);

  // Equation of time in minutes
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination angle in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const calcHourAngleMinutes = (zenithDeg: number): number => {
    const cosHA =
      Math.cos(zenithDeg * rad) / (Math.cos(latitude * rad) * Math.cos(decl)) -
      Math.tan(latitude * rad) * Math.tan(decl);
    const clamped = Math.max(-0.999, Math.min(0.999, cosHA));
    return Math.acos(clamped) * deg * 4;
  };

  const haStandard = calcHourAngleMinutes(90.833);
  const haDawn16_1 = calcHourAngleMinutes(106.1); // 16.1 deg below horizon
  const haDusk8_5 = calcHourAngleMinutes(98.5); // 8.5 deg below horizon

  const solarNoonUTCMin = 720 - 4 * longitude - eqTime;

  const baseUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const makeDateFromUTCMin = (utcMin: number) => new Date(baseUTC + Math.round(utcMin * 60000));

  return {
    solarNoon: makeDateFromUTCMin(solarNoonUTCMin),
    sunrise: makeDateFromUTCMin(solarNoonUTCMin - haStandard),
    sunset: makeDateFromUTCMin(solarNoonUTCMin + haStandard),
    dawn16_1: makeDateFromUTCMin(solarNoonUTCMin - haDawn16_1),
    dusk8_5: makeDateFromUTCMin(solarNoonUTCMin + haDusk8_5),
  };
}

export interface SolarPositionMetrics {
  altitudeDeg: number;
  maxNoonAltitudeDeg: number;
  azimuthDeg: number;
  compassDir: string;
  phaseLabel: string;
  shaahZmanitCurrent: number | null;
  daylightProgressPct: number;
}

export function getSolarPositionMetrics(
  instant: Date,
  latitude: number,
  longitude: number,
  sunrise: Date,
  sunset: Date
): SolarPositionMetrics {
  const startOfYear = new Date(Date.UTC(instant.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((instant.getTime() - startOfYear.getTime()) / 86400000);
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const utcMinutes =
    instant.getUTCHours() * 60 +
    instant.getUTCMinutes() +
    instant.getUTCSeconds() / 60;

  const gamma =
    ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcMinutes / 60 - 12) / 24);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const trueSolarTimeMin = (utcMinutes + 4 * longitude + eqTime + 1440) % 1440;
  const hourAngleDeg =
    trueSolarTimeMin / 4 < 0
      ? trueSolarTimeMin / 4 + 180
      : trueSolarTimeMin / 4 - 180;

  const sinAlt =
    Math.sin(latitude * rad) * Math.sin(decl) +
    Math.cos(latitude * rad) * Math.cos(decl) * Math.cos(hourAngleDeg * rad);
  const altitudeDeg = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * deg;

  // Peak altitude at Chatzot (hourAngle = 0)
  const sinNoon =
    Math.sin(latitude * rad) * Math.sin(decl) +
    Math.cos(latitude * rad) * Math.cos(decl);
  const maxNoonAltitudeDeg = Math.max(
    15,
    Math.asin(Math.max(-1, Math.min(1, sinNoon))) * deg
  );

  // Azimuth calculation
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz =
    (Math.sin(latitude * rad) * Math.cos(zenithRad) - Math.sin(decl)) /
    Math.max(0.0001, Math.cos(latitude * rad) * Math.sin(zenithRad));
  const azBase = Math.acos(Math.max(-1, Math.min(1, cosAz))) * deg;
  const azimuthDeg =
    hourAngleDeg > 0 ? (azBase + 180) % 360 : (540 - azBase) % 360;

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const compassDir = dirs[Math.round(azimuthDeg / 45) % 8];

  // Current Proportional Hour (1 to 12 during daylight)
  const dayMs = Math.max(1, sunset.getTime() - sunrise.getTime());
  const elapsedMs = instant.getTime() - sunrise.getTime();
  let shaahZmanitCurrent: number | null = null;
  let daylightProgressPct = 0;

  if (elapsedMs >= 0 && elapsedMs <= dayMs) {
    shaahZmanitCurrent = Math.round(((elapsedMs / dayMs) * 12) * 10) / 10;
    daylightProgressPct = Math.round((elapsedMs / dayMs) * 100);
  } else if (elapsedMs > dayMs) {
    daylightProgressPct = 100;
  }

  let phaseLabel = 'Nightfall (Tzeit HaKochavim)';
  if (altitudeDeg >= -0.833) {
    if (shaahZmanitCurrent !== null && shaahZmanitCurrent < 3) {
      phaseLabel = 'Morning · Kriat Shema Window';
    } else if (shaahZmanitCurrent !== null && shaahZmanitCurrent < 4) {
      phaseLabel = 'Morning · Amidah Tefillah Window';
    } else if (shaahZmanitCurrent !== null && shaahZmanitCurrent < 6.5) {
      phaseLabel = 'Midday · Chatzot Transition';
    } else if (shaahZmanitCurrent !== null && shaahZmanitCurrent < 10.75) {
      phaseLabel = 'Afternoon · Mincha Window';
    } else {
      phaseLabel = 'Late Afternoon · Plag HaMincha';
    }
  } else if (altitudeDeg >= -8.5) {
    phaseLabel =
      hourAngleDeg < 0
        ? 'Dawn Twilight · Misheyakir'
        : 'Twilight · Bein HaShemashot';
  } else if (altitudeDeg >= -16.1) {
    phaseLabel =
      hourAngleDeg < 0
        ? 'Alot HaShachar · Dawn Horizon'
        : 'Nightfall · Rabbeinu Tam Window';
  }

  return {
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
    maxNoonAltitudeDeg: Math.round(maxNoonAltitudeDeg * 10) / 10,
    azimuthDeg: Math.round(azimuthDeg),
    compassDir,
    phaseLabel,
    shaahZmanitCurrent,
    daylightProgressPct,
  };
}

export function buildZmanimFromAstronomy(
  date: Date,
  location: LocationConfig,
  shita: ShitaOpinion,
  hebcalTimes?: Record<string, string>
): ZmanimData {
  const solar = calculateSolarEvents(date, location.latitude, location.longitude);

  const parseHebcalOrFallback = (key: string, fallback: Date): Date => {
    if (hebcalTimes && hebcalTimes[key]) {
      const parsed = new Date(hebcalTimes[key]);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return fallback;
  };

  const sunrise = parseHebcalOrFallback('sunrise', solar.sunrise);
  const sunset = parseHebcalOrFallback('sunset', solar.sunset);

  // Day lengths
  const graDayMs = sunset.getTime() - sunrise.getTime();
  const shaahGraMs = graDayMs / 12;

  // MGA day: 72 minutes before sunrise to 72 minutes after sunset
  const alo72 = new Date(sunrise.getTime() - 72 * 60000);
  const tzeit72 = new Date(sunset.getTime() + 72 * 60000);
  const mgaDayMs = tzeit72.getTime() - alo72.getTime();
  const shaahMgaMs = mgaDayMs / 12;

  // Alot HaShachar
  const alotTime =
    shita === 'MGA'
      ? parseHebcalOrFallback('alotHaShachar', alo72)
      : parseHebcalOrFallback('alotHaShachar', solar.dawn16_1);

  // Misheyakir (Earliest Tallit & Tefillin) ~ 11.5 degrees or ~50 mins before sunrise
  const misheyakirFallback = new Date(sunrise.getTime() - 52 * 60000);
  const misheyakirTime = parseHebcalOrFallback('misheyakir', misheyakirFallback);

  // Sof Zman Kriat Shema (MGA)
  const shemaMgaFallback = new Date(alo72.getTime() + 3 * shaahMgaMs);
  const shemaMgaTime = parseHebcalOrFallback('sofZmanShmaMGA', shemaMgaFallback);

  // Sof Zman Kriat Shema (GRA / Baal HaTanya)
  const shemaGraFallback = new Date(sunrise.getTime() + 3 * shaahGraMs);
  const shemaGraTime = parseHebcalOrFallback('sofZmanShma', shemaGraFallback);

  // Sof Zman Tefillah
  const tefillahFallback =
    shita === 'MGA'
      ? new Date(alo72.getTime() + 4 * shaahMgaMs)
      : new Date(sunrise.getTime() + 4 * shaahGraMs);
  const tefillahTime = parseHebcalOrFallback(
    shita === 'MGA' ? 'sofZmanTfillaMGA' : 'sofZmanTfilla',
    tefillahFallback
  );

  // Chatzot HaYom
  const chatzotFallback = new Date(sunrise.getTime() + 6 * shaahGraMs);
  const chatzotTime = parseHebcalOrFallback('chatzot', chatzotFallback);

  // Mincha Gedolah (6.5 proportional hours)
  const minchaGedolahFallback = new Date(
    sunrise.getTime() + Math.max(6.5 * shaahGraMs, 6 * shaahGraMs + 30 * 60000)
  );
  const minchaGedolahTime = parseHebcalOrFallback('minchaGedola', minchaGedolahFallback);

  // Mincha Ketanah (9.5 proportional hours)
  const minchaKetanahFallback = new Date(sunrise.getTime() + 9.5 * shaahGraMs);
  const minchaKetanahTime = parseHebcalOrFallback('minchaKetana', minchaKetanahFallback);

  // Plag HaMincha (10.75 proportional hours)
  const plagFallback = new Date(sunrise.getTime() + 10.75 * shaahGraMs);
  const plagTime = parseHebcalOrFallback('plagHaMincha', plagFallback);

  // Tzeit HaKochavim (Nightfall — 3 medium stars / 8.5 deg)
  const tzeitTime = parseHebcalOrFallback('tzeit85deg', solar.dusk8_5);

  // Tzeit Rabbeinu Tam (72 minutes after sunset)
  const rtTime = tzeit72;

  // Chatzot HaLaylah (Halachic Midnight — 12 hours after Chatzot HaYom)
  const chatzotNightTime = new Date(chatzotTime.getTime() + 12 * 3600000);

  const items: ZmanItem[] = [
    {
      id: 'alot',
      titleEn: 'Alot HaShachar',
      titleHe: 'עלות השחר',
      category: 'dawn',
      time: alotTime,
      formattedTime: formatTimeInTz(alotTime, location.tzid),
      description: 'Halachic Dawn · Beginning of daytime obligations',
      halachicNote:
        shita === 'MGA'
          ? '72 minutes prior to sunrise (Magen Avraham)'
          : '16.1° solar depression angle below the eastern horizon',
    },
    {
      id: 'misheyakir',
      titleEn: 'Misheyakir',
      titleHe: 'משיכיר · טלית ותפילין',
      category: 'dawn',
      time: misheyakirTime,
      formattedTime: formatTimeInTz(misheyakirTime, location.tzid),
      description: 'Earliest Tallit & Tefillin',
      halachicNote: '11.5° solar depression angle (light sufficient to recognize an acquaintance)',
    },
    {
      id: 'sunrise',
      titleEn: 'Netz HaChama',
      titleHe: 'נץ החמה · זריחה',
      category: 'morning',
      time: sunrise,
      formattedTime: formatTimeInTz(sunrise, location.tzid),
      description: 'Halachic Sunrise · Ideal time for Shacharit Amidah (Vasikin)',
      halachicNote: 'Upper limb of the sun appears at sea-level horizon',
      isPrimary: true,
    },
    {
      id: 'shema_mga',
      titleEn: 'Sof Zman Shema (MGA)',
      titleHe: 'סוף זמן קריאת שמע (מג״א)',
      category: 'morning',
      time: shemaMgaTime,
      formattedTime: formatTimeInTz(shemaMgaTime, location.tzid),
      description: 'Latest Shema according to Magen Avraham',
      halachicNote: '3 proportional hours (Sha’ot Zmaniyot) from Alot HaShachar to Tzeit',
      isPrimary: shita === 'MGA',
    },
    {
      id: 'shema_gra',
      titleEn:
        shita === 'BAAL_HATANYA'
          ? 'Sof Zman Shema (Baal HaTanya)'
          : 'Sof Zman Shema (GRA)',
      titleHe:
        shita === 'BAAL_HATANYA'
          ? 'סוף זמן ק״ש (בעל התניא)'
          : 'סוף זמן קריאת שמע (גר״א)',
      category: 'morning',
      time: shemaGraTime,
      formattedTime: formatTimeInTz(shemaGraTime, location.tzid),
      description: 'Latest Shema according to Vilna Gaon & Baal HaTanya',
      halachicNote: '3 proportional hours calculated from Sunrise (Netz) to Sunset (Shkiah)',
      isPrimary: shita !== 'MGA',
    },
    {
      id: 'tefillah',
      titleEn: 'Sof Zman Tefillah',
      titleHe: 'סוף זמן תפילה',
      category: 'morning',
      time: tefillahTime,
      formattedTime: formatTimeInTz(tefillahTime, location.tzid),
      description: 'Latest time for Shacharit Amidah',
      halachicNote: '4 proportional hours into the Halachic day',
      isPrimary: true,
    },
    {
      id: 'chatzot',
      titleEn: 'Chatzot HaYom',
      titleHe: 'חצות היום',
      category: 'midday',
      time: chatzotTime,
      formattedTime: formatTimeInTz(chatzotTime, location.tzid),
      description: 'Halachic Midday · Solar Zenith',
      halachicNote: 'Exact midpoint between Sunrise and Sunset (6 proportional hours)',
    },
    {
      id: 'mincha_gedolah',
      titleEn: 'Mincha Gedolah',
      titleHe: 'מנחה גדולה',
      category: 'afternoon',
      time: minchaGedolahTime,
      formattedTime: formatTimeInTz(minchaGedolahTime, location.tzid),
      description: 'Earliest time to recite afternoon Mincha prayer',
      halachicNote: '6.5 proportional hours into the day (minimum 30 min after Chatzot)',
    },
    {
      id: 'mincha_ketanah',
      titleEn: 'Mincha Ketanah',
      titleHe: 'מנחה קטנה',
      category: 'afternoon',
      time: minchaKetanahTime,
      formattedTime: formatTimeInTz(minchaKetanahTime, location.tzid),
      description: 'Preferred afternoon window for Mincha',
      halachicNote: '9.5 proportional hours into the day (2.5 proportional hours before sunset)',
    },
    {
      id: 'plag',
      titleEn: 'Plag HaMincha',
      titleHe: 'פלג המנחה',
      category: 'afternoon',
      time: plagTime,
      formattedTime: formatTimeInTz(plagTime, location.tzid),
      description: 'Transition window · Earliest Shabbat candle lighting & Maariv',
      halachicNote: '10.75 proportional hours into the day (1.25 proportional hours before sunset)',
    },
    {
      id: 'sunset',
      titleEn: 'Shkiah (Sunset)',
      titleHe: 'שקיעת החמה',
      category: 'evening',
      time: sunset,
      formattedTime: formatTimeInTz(sunset, location.tzid),
      description: 'Halachic Sunset · Beginning of Bein HaShemashot (Twilight)',
      halachicNote: 'Deadline for Mincha & daytime mitzvot',
      isPrimary: true,
    },
    {
      id: 'tzeit',
      titleEn: 'Tzeit HaKochavim',
      titleHe: 'צאת הכוכבים',
      category: 'night',
      time: tzeitTime,
      formattedTime: formatTimeInTz(tzeitTime, location.tzid),
      description: 'Nightfall · Maariv, Kriat Shema al HaMitah & Sefirah',
      halachicNote: '8.5° solar depression angle (appearance of three medium stars)',
      isPrimary: true,
    },
    {
      id: 'rabbeinu_tam',
      titleEn: 'Tzeit Rabbeinu Tam',
      titleHe: 'צאת רבינו תם (72 דק׳)',
      category: 'night',
      time: rtTime,
      formattedTime: formatTimeInTz(rtTime, location.tzid),
      description: 'Stringent Nightfall (72 minutes after Shkiah)',
      halachicNote: '4 Mil (72 fixed minutes) after sunset according to Rabbeinu Tam',
    },
    {
      id: 'chatzot_night',
      titleEn: 'Chatzot HaLaylah',
      titleHe: 'חצות הלילה · תיקון חצות',
      category: 'night',
      time: chatzotNightTime,
      formattedTime: formatTimeInTz(chatzotNightTime, location.tzid),
      description: 'Halachic Midnight · Time for Tikkun Chatzot',
      halachicNote: 'Midpoint between Sunset and the following Sunrise',
    },
  ];

  const hebDates = getHebrewDateStrings(date);

  return {
    dateStr: formatDateYMD(date, location.tzid),
    hebrewDateEn: hebDates.en,
    hebrewDateHe: hebDates.he,
    shaahZmanitGraMinutes: Math.round((shaahGraMs / 60000) * 10) / 10,
    shaahZmanitMgaMinutes: Math.round((shaahMgaMs / 60000) * 10) / 10,
    sunrise,
    sunset,
    items,
    source: hebcalTimes ? 'hebcal' : 'astronomical',
  };
}

export async function fetchZmanimForDate(
  date: Date,
  location: LocationConfig,
  shita: ShitaOpinion
): Promise<ZmanimData> {
  const ymd = formatDateYMD(date, location.tzid);
  try {
    const url = `https://www.hebcal.com/zmanim?cfg=json&latitude=${location.latitude}&longitude=${location.longitude}&tzid=${encodeURIComponent(
      location.tzid
    )}&date=${ymd}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Hebcal zmanim error');
    const data = await res.json();
    if (data && data.times) {
      return buildZmanimFromAstronomy(date, location, shita, data.times);
    }
  } catch {
    // Fallback to deterministic NOAA Halachic calculation
  }
  return buildZmanimFromAstronomy(date, location, shita);
}

const DEFAULT_PARSHA_FALLBACK: ParshaData = {
  nameEn: 'Parashat Chayei Sarah',
  nameHe: 'פרשת חיי שרה',
  fullRef: 'Genesis 23:1–25:18',
  haftarahRef: 'I Kings 1:1–31',
  candleLighting: '4:39 PM',
  havdalah: '5:39 PM',
  shabbatDateStr: 'Shabbat · 22 Cheshvan',
  summary:
    'Abraham purchases the Cave of Machpelah in Hebron as a burial site for Sarah, and sends his faithful servant Eliezer to Aram Naharaim to find a righteous wife, Rebecca, for Isaac.',
  aliyot: [
    { num: '1', labelEn: 'First Aliyah (Kohen)', labelHe: 'ראשון', ref: 'Genesis 23:1-23:16' },
    { num: '2', labelEn: 'Second Aliyah (Levi)', labelHe: 'שני', ref: 'Genesis 23:17-24:9' },
    { num: '3', labelEn: 'Third Aliyah (Shlishi)', labelHe: 'שלישי', ref: 'Genesis 24:10-24:26' },
    { num: '4', labelEn: 'Fourth Aliyah (Revi’i)', labelHe: 'רביעי', ref: 'Genesis 24:27-24:52' },
    { num: '5', labelEn: 'Fifth Aliyah (Chamishi)', labelHe: 'חמישי', ref: 'Genesis 24:53-24:67' },
    { num: '6', labelEn: 'Sixth Aliyah (Shishi)', labelHe: 'שישי', ref: 'Genesis 25:1-25:11' },
    { num: '7', labelEn: 'Seventh Aliyah (Shevi’i)', labelHe: 'שביעי', ref: 'Genesis 25:12-25:18' },
  ],
};

const DEFAULT_LIMUD_FALLBACK: LimudItem[] = [
  {
    id: 'chumash',
    titleEn: 'Daily Chumash (Chitas)',
    titleHe: 'חומש יומי עם רש״י',
    displayValueEn: 'Chayei Sarah, 1st Aliyah',
    displayValueHe: 'חיי שרה · ראשון',
    ref: 'Genesis 23:1-23:16',
    category: 'Chitas',
  },
  {
    id: 'daf-yomi',
    titleEn: 'Daf Yomi (Bavli)',
    titleHe: 'דף היומי בבלי',
    displayValueEn: 'Bava Batra 138',
    displayValueHe: 'בבא בתרא קל״ח',
    ref: 'Bava Batra 138a',
    category: 'Talmud',
  },
  {
    id: 'rambam-1',
    titleEn: 'Daily Rambam (1 Chapter)',
    titleHe: 'רמב״ם יומי (פרק אחד)',
    displayValueEn: 'Foundations of the Torah 4',
    displayValueHe: 'הלכות יסודי התורה פרק ד׳',
    ref: 'Mishneh Torah, Foundations of the Torah 4',
    category: 'Halakhah',
  },
  {
    id: 'rambam-3',
    titleEn: 'Daily Rambam (3 Chapters)',
    titleHe: 'רמב״ם יומי (ג׳ פרקים)',
    displayValueEn: 'Sabbath 10–12',
    displayValueHe: 'הלכות שבת פרקים י׳–י״ב',
    ref: 'Mishneh Torah, Sabbath 10',
    category: 'Halakhah',
  },
  {
    id: 'tanya',
    titleEn: 'Daily Tanya',
    titleHe: 'תניא יומי',
    displayValueEn: 'Iggeret HaKodesh, Epistle 18',
    displayValueHe: 'אגרת הקודש סימן י״ח',
    ref: 'Tanya, Iggeret HaKodesh 18',
    category: 'Chassidut',
  },
  {
    id: 'mishnah',
    titleEn: 'Mishnah Yomit',
    titleHe: 'משנה יומית',
    displayValueEn: 'Peah 3:5–6',
    displayValueHe: 'פאה ג׳:ה׳–ו׳',
    ref: 'Mishnah Peah 3:5-6',
    category: 'Mishnah',
  },
  {
    id: 'halakhah',
    titleEn: 'Halakhah Yomit',
    titleHe: 'הלכה יומית',
    displayValueEn: 'Shulchan Arukh, Orach Chayim 188:1–3',
    displayValueHe: 'שולחן ערוך אורח חיים קפ״ח',
    ref: 'Shulchan Arukh, Orach Chayim 188:1-3',
    category: 'Halakhah',
  },
];

export async function fetchParshaAndLimud(
  date: Date,
  location: LocationConfig
): Promise<{ parsha: ParshaData; limud: LimudItem[] }> {
  let parsha: ParshaData = { ...DEFAULT_PARSHA_FALLBACK };
  let limud: LimudItem[] = [...DEFAULT_LIMUD_FALLBACK];

  // Calculate accurate Friday candle lighting & Saturday Havdalah astronomically first as baseline
  const dayOfWeek = date.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const fridayDate = new Date(date.getTime() + daysUntilFriday * 86400000);
  const saturdayDate = new Date(fridayDate.getTime() + 86400000);

  const friSolar = calculateSolarEvents(fridayDate, location.latitude, location.longitude);
  const satSolar = calculateSolarEvents(saturdayDate, location.latitude, location.longitude);

  const candleTime = new Date(
    friSolar.sunset.getTime() - location.candleLightingMinutes * 60000
  );
  const havdalahTime = satSolar.dusk8_5;

  parsha.candleLighting = formatTimeInTz(candleTime, location.tzid);
  parsha.havdalah = formatTimeInTz(havdalahTime, location.tzid);
  parsha.shabbatDateStr = `Shabbat · ${getHebrewDateStrings(saturdayDate).en}`;

  // Fetch Sefaria Calendar API + Hebcal Shabbat API in parallel
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  try {
    const [sefariaRes, hebcalRes] = await Promise.allSettled([
      fetch(
        `https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${d}&diaspora=${
          location.tzid === 'Asia/Jerusalem' ? 0 : 1
        }`
      ),
      fetch(
        `https://www.hebcal.com/shabbat?cfg=json&latitude=${location.latitude}&longitude=${
          location.longitude
        }&tzid=${encodeURIComponent(location.tzid)}&b=${location.candleLightingMinutes}&M=on`
      ),
    ]);

    if (sefariaRes.status === 'fulfilled' && sefariaRes.value.ok) {
      const sefariaJson = await sefariaRes.value.json();
      const calItems: any[] = sefariaJson?.calendar_items || [];

      const parshaItem = calItems.find(
        (item) => item.title?.en === 'Parashat Hashavua'
      );
      const haftarahItem = calItems.find((item) => item.title?.en === 'Haftarah');

      if (parshaItem) {
        parsha.nameEn = `Parashat ${parshaItem.displayValue?.en || 'Chayei Sarah'}`;
        parsha.nameHe = `פרשת ${parshaItem.displayValue?.he || 'חיי שרה'}`;
        parsha.fullRef = parshaItem.ref || parsha.fullRef;
        if (parshaItem.description?.en) {
          parsha.summary = parshaItem.description.en;
        }
        const detailsAliyot: string[] = parshaItem.extraDetails?.aliyot || [];
        if (detailsAliyot.length >= 7) {
          const labelsEn = [
            'First Aliyah (Kohen)',
            'Second Aliyah (Levi)',
            'Third Aliyah (Shlishi)',
            'Fourth Aliyah (Revi’i)',
            'Fifth Aliyah (Chamishi)',
            'Sixth Aliyah (Shishi)',
            'Seventh Aliyah (Shevi’i)',
          ];
          const labelsHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי'];
          parsha.aliyot = detailsAliyot.slice(0, 7).map((refStr, idx): AliyahItem => ({
            num: String(idx + 1),
            labelEn: labelsEn[idx] || `Aliyah ${idx + 1}`,
            labelHe: labelsHe[idx] || `${idx + 1}`,
            ref: refStr,
          }));
        }
      }

      if (haftarahItem) {
        parsha.haftarahRef = haftarahItem.displayValue?.en || haftarahItem.ref || parsha.haftarahRef;
      }

      const mappedLimud: LimudItem[] = [];
      for (const item of calItems) {
        const titleEn = item.title?.en || '';
        if (titleEn === 'Parashat Hashavua') continue;
        mappedLimud.push({
          id: titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          titleEn: titleEn,
          titleHe: item.title?.he || titleEn,
          displayValueEn: item.displayValue?.en || item.ref,
          displayValueHe: item.displayValue?.he || item.displayValue?.en || '',
          ref: item.ref || item.url || '',
          category: item.category || 'Torah Study',
        });
      }
      if (mappedLimud.length > 0) {
        limud = mappedLimud.slice(0, 8);
      }
    }

    if (hebcalRes.status === 'fulfilled' && hebcalRes.value.ok) {
      const hebcalJson = await hebcalRes.value.json();
      const items: any[] = hebcalJson?.items || [];
      const candles = items.find((i) => i.category === 'candles');
      const havdalah = items.find((i) => i.category === 'havdalah');
      const parashat = items.find((i) => i.category === 'parashat');

      if (candles?.date) {
        parsha.candleLighting = formatTimeInTz(new Date(candles.date), location.tzid);
      }
      if (havdalah?.date) {
        parsha.havdalah = formatTimeInTz(new Date(havdalah.date), location.tzid);
      }
      if (parashat?.title && !parsha.nameEn) {
        parsha.nameEn = parashat.title;
        parsha.nameHe = parashat.hebrew || parsha.nameHe;
      }
    }
  } catch {
    // Keep astronomical and curated fallback
  }

  return { parsha, limud };
}

export interface SefariaTextPassage {
  ref: string;
  heRef: string;
  verses: { num: number; he: string; en: string }[];
}

function stripHtmlTags(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchSefariaText(ref: string): Promise<SefariaTextPassage> {
  try {
    const cleanRef = encodeURIComponent(ref);
    const res = await fetch(`https://www.sefaria.org/api/texts/${cleanRef}?context=0&pad=0`);
    if (!res.ok) throw new Error('Sefaria text request failed');
    const data = await res.json();

    const flattenLines = (arr: any): string[] => {
      if (!arr) return [];
      if (typeof arr === 'string') return [stripHtmlTags(arr)];
      if (Array.isArray(arr)) {
        const result: string[] = [];
        for (const el of arr) {
          result.push(...flattenLines(el));
        }
        return result.filter(Boolean);
      }
      return [];
    };

    const heLines = flattenLines(data.he);
    const enLines = flattenLines(data.text);
    const count = Math.min(Math.max(heLines.length, enLines.length), 25);

    const verses = [];
    for (let i = 0; i < count; i++) {
      verses.push({
        num: i + 1,
        he: heLines[i] || '',
        en: enLines[i] || '',
      });
    }

    if (verses.length > 0) {
      return {
        ref: data.ref || ref,
        heRef: data.heRef || '',
        verses,
      };
    }
  } catch {
    // Fallback bilingual verses if network blocked
  }

  return {
    ref,
    heRef: 'פרשת השבוע',
    verses: [
      {
        num: 1,
        he: 'וַיִּהְיוּ חַיֵּי שָׂרָה מֵאָה שָׁנָה וְעֶשְׂרִים שָׁנָה וְשֶׁבַע שָׁנִים שְׁנֵי חַיֵּי שָׂרָה׃',
        en: 'Sarah’s lifetime—the span of Sarah’s life—came to one hundred and twenty-seven years.',
      },
      {
        num: 2,
        he: 'וַתָּמָת שָׂרָה בְּקִרְיַת אַרְבַּע הִוא חֶבְרוֹן בְּאֶרֶץ כְּנָעַן וַיָּבֹא אַבְרָהָם לִסְפֹּד לְשָׂרָה וְלִבְכֹּתָהּ׃',
        en: 'Sarah died in Kiriath-arba—now Hebron—in the land of Canaan; and Abraham proceeded to mourn for Sarah and to bewail her.',
      },
      {
        num: 3,
        he: 'וַיָּקָם אַבְרָהָם מֵעַל פְּנֵי מֵתוֹ וַיְדַבֵּר אֶל־בְּנֵי־חֵת לֵאמֹר׃',
        en: 'Then Abraham rose from beside his dead, and spoke to the children of Heth, saying:',
      },
    ],
  };
}

interface MasechetSpec {
  en: string;
  he: string;
  sederEn: string;
  sederHe: string;
  dappim: number;
  startDaf: number;
}

const DAF_YOMI_MASECHTOT: MasechetSpec[] = [
  { en: 'Berakhot', he: 'ברכות', sederEn: 'Zeraim', sederHe: 'זרעים', dappim: 63, startDaf: 2 },
  { en: 'Shabbat', he: 'שבת', sederEn: 'Moed', sederHe: 'מועד', dappim: 156, startDaf: 2 },
  { en: 'Eruvin', he: 'עירובין', sederEn: 'Moed', sederHe: 'מועד', dappim: 104, startDaf: 2 },
  { en: 'Pesachim', he: 'פסחים', sederEn: 'Moed', sederHe: 'מועד', dappim: 120, startDaf: 2 },
  { en: 'Shekalim', he: 'שקלים', sederEn: 'Moed', sederHe: 'מועד', dappim: 21, startDaf: 2 },
  { en: 'Yoma', he: 'יומא', sederEn: 'Moed', sederHe: 'מועד', dappim: 87, startDaf: 2 },
  { en: 'Sukkah', he: 'סוכה', sederEn: 'Moed', sederHe: 'מועד', dappim: 55, startDaf: 2 },
  { en: 'Beitzah', he: 'ביצה', sederEn: 'Moed', sederHe: 'מועד', dappim: 39, startDaf: 2 },
  { en: 'Rosh Hashanah', he: 'ראש השנה', sederEn: 'Moed', sederHe: 'מועד', dappim: 34, startDaf: 2 },
  { en: 'Taanit', he: 'תענית', sederEn: 'Moed', sederHe: 'מועד', dappim: 30, startDaf: 2 },
  { en: 'Megillah', he: 'מגילה', sederEn: 'Moed', sederHe: 'מועד', dappim: 31, startDaf: 2 },
  { en: 'Moed Katan', he: 'מועד קטן', sederEn: 'Moed', sederHe: 'מועד', dappim: 28, startDaf: 2 },
  { en: 'Chagigah', he: 'חגיגה', sederEn: 'Moed', sederHe: 'מועד', dappim: 26, startDaf: 2 },
  { en: 'Yevamot', he: 'יבמות', sederEn: 'Nashim', sederHe: 'נשים', dappim: 121, startDaf: 2 },
  { en: 'Ketubot', he: 'כתובות', sederEn: 'Nashim', sederHe: 'נשים', dappim: 111, startDaf: 2 },
  { en: 'Nedarim', he: 'נדרים', sederEn: 'Nashim', sederHe: 'נשים', dappim: 90, startDaf: 2 },
  { en: 'Nazir', he: 'נזיר', sederEn: 'Nashim', sederHe: 'נשים', dappim: 65, startDaf: 2 },
  { en: 'Sotah', he: 'סוטה', sederEn: 'Nashim', sederHe: 'נשים', dappim: 48, startDaf: 2 },
  { en: 'Gittin', he: 'גיטין', sederEn: 'Nashim', sederHe: 'נשים', dappim: 89, startDaf: 2 },
  { en: 'Kiddushin', he: 'קידושין', sederEn: 'Nashim', sederHe: 'נשים', dappim: 81, startDaf: 2 },
  { en: 'Bava Kamma', he: 'בבא קמא', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 118, startDaf: 2 },
  { en: 'Bava Metzia', he: 'בבא מציעא', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 118, startDaf: 2 },
  { en: 'Bava Batra', he: 'בבא בתרא', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 175, startDaf: 2 },
  { en: 'Sanhedrin', he: 'סנהדרין', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 112, startDaf: 2 },
  { en: 'Makkot', he: 'מכות', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 23, startDaf: 2 },
  { en: 'Shevuot', he: 'שבועות', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 48, startDaf: 2 },
  { en: 'Avodah Zarah', he: 'עבודה זרה', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 75, startDaf: 2 },
  { en: 'Horayot', he: 'הוריות', sederEn: 'Nezikin', sederHe: 'נזיקין', dappim: 13, startDaf: 2 },
  { en: 'Zevachim', he: 'זבחים', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 119, startDaf: 2 },
  { en: 'Menachot', he: 'מנחות', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 109, startDaf: 2 },
  { en: 'Chullin', he: 'חולין', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 141, startDaf: 2 },
  { en: 'Bekhorot', he: 'בכורות', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 60, startDaf: 2 },
  { en: 'Arakhin', he: 'ערכין', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 33, startDaf: 2 },
  { en: 'Temurah', he: 'תמורה', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 33, startDaf: 2 },
  { en: 'Keritot', he: 'כריתות', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 27, startDaf: 2 },
  { en: 'Meilah', he: 'מעילה', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 21, startDaf: 2 },
  { en: 'Tamid', he: 'תמיד', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 9, startDaf: 25 },
  { en: 'Middot', he: 'מידות', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 4, startDaf: 34 },
  { en: 'Kinnim', he: 'קינים', sederEn: 'Kodashim', sederHe: 'קדשים', dappim: 3, startDaf: 22 },
  { en: 'Niddah', he: 'נידה', sederEn: 'Tahorot', sederHe: 'טהרות', dappim: 72, startDaf: 2 },
];

export function numberToHebrewGematria(num: number): string {
  if (HEBREW_GEMATRIA_DAYS[num]) return HEBREW_GEMATRIA_DAYS[num];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

  const h = Math.floor(num / 100);
  const rem = num % 100;
  let letters = hundreds[h] || '';
  if (rem === 15) {
    letters += 'טו';
  } else if (rem === 16) {
    letters += 'טז';
  } else {
    letters += (tens[Math.floor(rem / 10)] || '') + (ones[rem % 10] || '');
  }

  if (letters.length === 1) return `${letters}׳`;
  if (letters.length > 1) {
    return `${letters.slice(0, -1)}״${letters.slice(-1)}`;
  }
  return String(num);
}

export function calculateDafYomiForDate(date: Date): DafYomiData {
  // Cycle 14 started Jan 5, 2020 (2,711 total dappim per cycle)
  const cycleStartUtc = Date.UTC(2020, 0, 5, 12, 0, 0);
  const targetUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0
  );
  const totalDaysInCycle = DAF_YOMI_MASECHTOT.reduce((acc, m) => acc + m.dappim, 0); // 2711
  const diffDays = Math.floor((targetUtc - cycleStartUtc) / 86400000);
  const cycleIndex =
    ((diffDays % totalDaysInCycle) + totalDaysInCycle) % totalDaysInCycle;

  let running = 0;
  let chosen = DAF_YOMI_MASECHTOT[0];
  let offsetInMasechet = 0;

  for (const m of DAF_YOMI_MASECHTOT) {
    if (cycleIndex < running + m.dappim) {
      chosen = m;
      offsetInMasechet = cycleIndex - running;
      break;
    }
    running += m.dappim;
  }

  const dafNum = chosen.startDaf + offsetInMasechet;
  const dafHe = numberToHebrewGematria(dafNum);
  const progressDia = offsetInMasechet + 1;
  const masechetProgressPct = Math.round((progressDia / chosen.dappim) * 100);
  const daysUntilSiyumMasechet = chosen.dappim - progressDia;
  const cycleProgressPct =
    Math.round(((cycleIndex + 1) / totalDaysInCycle) * 1000) / 10;

  return {
    masechetEn: chosen.en,
    masechetHe: chosen.he,
    sederEn: `Seder ${chosen.sederEn}`,
    sederHe: `סדר ${chosen.sederHe}`,
    dafNum,
    dafHe,
    masechetTotalDappim: chosen.dappim,
    masechetProgressDia: progressDia,
    masechetProgressPct,
    daysUntilSiyumMasechet,
    cycleDayIndex: cycleIndex + 1,
    cycleTotalDays: totalDaysInCycle,
    cycleProgressPct,
    refAmudA: `${chosen.en} ${dafNum}a`,
    refAmudB: `${chosen.en} ${dafNum}b`,
  };
}

// Exact coordinates of Kodesh HaKodashim (Har HaBayit / Temple Mount, Jerusalem)
const KODESH_HAKODASHIM_LAT = 31.778;
const KODESH_HAKODASHIM_LON = 35.2354;

function degreeTo16PointCardinal(deg: number): string {
  const dirs = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

export function calculateMizrachMetrics(
  userLat: number,
  userLon: number
): MizrachMetrics {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const phi1 = userLat * rad;
  const phi2 = KODESH_HAKODASHIM_LAT * rad;
  const deltaPhi = (KODESH_HAKODASHIM_LAT - userLat) * rad;
  const deltaLambda = (KODESH_HAKODASHIM_LON - userLon) * rad;

  // 1. Great-Circle (Orthodromic / Geodesic) Forward Azimuth
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  const greatCircleBearingDeg =
    Math.round((((theta * deg + 360) % 360) * 10)) / 10;

  // 2. Rhumb-Line (Loxodromic / Constant Compass) Bearing
  const deltaPsi = Math.log(
    Math.tan(Math.PI / 4 + phi2 / 2) / Math.tan(Math.PI / 4 + phi1 / 2)
  );
  let dLonRhumb = deltaLambda;
  if (Math.abs(dLonRhumb) > Math.PI) {
    dLonRhumb =
      dLonRhumb > 0
        ? -(2 * Math.PI - dLonRhumb)
        : 2 * Math.PI + dLonRhumb;
  }
  const rhumbTheta = Math.atan2(dLonRhumb, deltaPsi);
  const rhumbLineBearingDeg =
    Math.round((((rhumbTheta * deg + 360) % 360) * 10)) / 10;

  // 3. Haversine Great-Circle Distance to Kodesh HaKodashim
  const earthRadiusKm = 6371;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(earthRadiusKm * c);
  const distanceMiles = Math.round(distanceKm * 0.621371);

  return {
    greatCircleBearingDeg,
    greatCircleCardinal: degreeTo16PointCardinal(greatCircleBearingDeg),
    rhumbLineBearingDeg,
    rhumbLineCardinal: degreeTo16PointCardinal(rhumbLineBearingDeg),
    distanceKm,
    distanceMiles,
    isNearTempleMount: distanceKm < 15,
  };
}

export interface HebrewMonthSolarDayPoint {
  date: Date;
  ymd: string;
  hebrewDayNum: number;
  hebrewDayGematria: string;
  gregorianLabel: string;
  sunrise: Date;
  sunset: Date;
  sunriseMin: number; // Local minutes from midnight (e.g., 390.5 = 6:30:30 AM)
  sunsetMin: number;  // Local minutes from midnight (e.g., 1065.2 = 5:45:12 PM)
  sunriseFormatted: string;
  sunsetFormatted: string;
  daylightMinutes: number;
  shaahZmanitMin: number;
  isSelected: boolean;
  isToday: boolean;
  isShabbat: boolean;
}

export interface HebrewMonthSolarSeries {
  hebrewMonthNameEn: string;
  hebrewMonthNameHe: string;
  hebrewYearEn: string;
  gregorianRangeLabel: string;
  days: HebrewMonthSolarDayPoint[];
  sunriseShiftMinutes: number;
  sunsetShiftMinutes: number;
  daylightDeltaMinutes: number;
}

function getMinutesFromMidnightInTz(date: Date, tzid: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZone: tzid,
    }).formatToParts(date);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const s = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    return h * 60 + m + s / 60;
  } catch {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  }
}

export function formatMinutesFromMidnight(totalMin: number): string {
  const rounded = Math.round(totalMin);
  const h24 = Math.floor(rounded / 60) % 24;
  const m = rounded % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function buildHebrewMonthSolarSeries(
  referenceDate: Date,
  location: LocationConfig
): HebrewMonthSolarSeries {
  const monthGrid = buildHebrewMonthGrid(referenceDate, referenceDate);
  const currentMonthCells = monthGrid.cells.filter((c) => c.isCurrentHebrewMonth);

  const days: HebrewMonthSolarDayPoint[] = currentMonthCells.map((cell) => {
    const solar = calculateSolarEvents(
      cell.date,
      location.latitude,
      location.longitude
    );
    const sunriseMin = getMinutesFromMidnightInTz(solar.sunrise, location.tzid);
    const sunsetMin = getMinutesFromMidnightInTz(solar.sunset, location.tzid);
    const daylightMinutes = Math.max(
      1,
      Math.round((solar.sunset.getTime() - solar.sunrise.getTime()) / 60000)
    );
    const shaahZmanitMin = Math.round((daylightMinutes / 12) * 10) / 10;

    return {
      date: cell.date,
      ymd: cell.ymd,
      hebrewDayNum: cell.hebrewDayNum,
      hebrewDayGematria: cell.hebrewDayGematria,
      gregorianLabel: `${cell.gregorianMonthShort} ${cell.gregorianDayNum}`,
      sunrise: solar.sunrise,
      sunset: solar.sunset,
      sunriseMin,
      sunsetMin,
      sunriseFormatted: formatTimeInTz(solar.sunrise, location.tzid),
      sunsetFormatted: formatTimeInTz(solar.sunset, location.tzid),
      daylightMinutes,
      shaahZmanitMin,
      isSelected: cell.isSelected,
      isToday: cell.isToday,
      isShabbat: cell.isShabbat,
    };
  });

  const first = days[0];
  const last = days[days.length - 1];
  const sunriseShiftMinutes =
    first && last ? Math.round(last.sunriseMin - first.sunriseMin) : 0;
  const sunsetShiftMinutes =
    first && last ? Math.round(last.sunsetMin - first.sunsetMin) : 0;
  const daylightDeltaMinutes =
    first && last ? last.daylightMinutes - first.daylightMinutes : 0;

  return {
    hebrewMonthNameEn: monthGrid.hebrewMonthNameEn,
    hebrewMonthNameHe: monthGrid.hebrewMonthNameHe,
    hebrewYearEn: monthGrid.hebrewYearEn,
    gregorianRangeLabel: monthGrid.gregorianRangeLabel,
    days,
    sunriseShiftMinutes,
    sunsetShiftMinutes,
    daylightDeltaMinutes,
  };
}

interface HolidayRuleDef {
  id: string;
  nameEn: string;
  nameHe: string;
  monthMatch: (mLower: string) => boolean;
  dayNum: number;
  category: JewishHolidayEvent['category'];
  categoryLabel: string;
  isMajorFestival: boolean;
  durationLabel: string;
  mitzvotSummary: string;
  sefariaRef: string;
}

const JEWISH_HOLIDAY_RULES: HolidayRuleDef[] = [
  {
    id: 'rosh-hashanah',
    nameEn: 'Rosh Hashanah',
    nameHe: 'ראש השנה',
    monthMatch: (m) => m.includes('tishr'),
    dayNum: 1,
    category: 'major_yom_tov',
    categoryLabel: 'Yom HaDin · High Holy Days',
    isMajorFestival: true,
    durationLabel: '2 Days (1–2 Tishrei)',
    mitzvotSummary: 'Hearing the Shofar (100 blasts), Festive Yom Tov meals with apple & honey, Tashlich.',
    sefariaRef: 'Leviticus 23:23-25',
  },
  {
    id: 'yom-kippur',
    nameEn: 'Yom Kippur',
    nameHe: 'יום הכיפורים',
    monthMatch: (m) => m.includes('tishr'),
    dayNum: 10,
    category: 'major_yom_tov',
    categoryLabel: 'Day of Atonement · High Holy Days',
    isMajorFestival: true,
    durationLabel: '1 Day (10 Tishrei · 25h Fast)',
    mitzvotSummary: 'Kol Nidrei, Five Tefillot culminating in Ne’ilah, Teshuvah, and complete Shabbaton.',
    sefariaRef: 'Leviticus 16:29-34',
  },
  {
    id: 'sukkot',
    nameEn: 'Sukkot (Chag HaSukkot)',
    nameHe: 'חג הסוכות',
    monthMatch: (m) => m.includes('tishr'),
    dayNum: 15,
    category: 'major_yom_tov',
    categoryLabel: 'Shalosh Regalim · Zman Simchateinu',
    isMajorFestival: true,
    durationLabel: '7 Days (15–21 Tishrei)',
    mitzvotSummary: 'Dwelling in the Sukkah, taking the Four Species (Lulav, Etrog, Hadassim, Aravot), Hallel & Simchat Beit HaShoevah.',
    sefariaRef: 'Leviticus 23:33-43',
  },
  {
    id: 'shemini-atzeret-simchat-torah',
    nameEn: 'Shemini Atzeret & Simchat Torah',
    nameHe: 'שמיני עצרת ושמחת תורה',
    monthMatch: (m) => m.includes('tishr'),
    dayNum: 22,
    category: 'major_yom_tov',
    categoryLabel: 'Major Yom Tov · Completion of the Torah',
    isMajorFestival: true,
    durationLabel: '2 Days in Diaspora (22–23 Tishrei)',
    mitzvotSummary: 'Tefillat Geshem (Prayer for Rain), Yizkor, joyous Hakafot dancing with the Sefer Torah, and completing V’Zot HaBerachah.',
    sefariaRef: 'Deuteronomy 34:1-12',
  },
  {
    id: 'chanukah',
    nameEn: 'Chanukah (1st Day)',
    nameHe: 'חנוכה · חג האורים',
    monthMatch: (m) => m.includes('kislev'),
    dayNum: 25,
    category: 'rabbinic_festival',
    categoryLabel: '8-Day Festival of Lights',
    isMajorFestival: true,
    durationLabel: '8 Days (25 Kislev – 2/3 Tevet)',
    mitzvotSummary: 'Kindling the Chanukah Menorah (pirsumei nisa), reciting complete Hallel and Al HaNissim.',
    sefariaRef: 'Shabbat 21b',
  },
  {
    id: 'asarah-btevet',
    nameEn: 'Asarah B’Tevet',
    nameHe: 'צום עשרה בטבת',
    monthMatch: (m) => m.includes('tevet'),
    dayNum: 10,
    category: 'fast_day',
    categoryLabel: 'Public Dawn-to-Nightfall Fast',
    isMajorFestival: false,
    durationLabel: 'Dawn to Tzeit (10 Tevet)',
    mitzvotSummary: 'Public fast commemorating the Babylonian siege of Jerusalem; Selichot & Aneinu.',
    sefariaRef: 'Zechariah 8:19',
  },
  {
    id: 'tu-bishvat',
    nameEn: 'Tu BiShvat',
    nameHe: 'ט״ו בשבט · ראש השנה לאילנות',
    monthMatch: (m) => m.includes('shevat') || m.includes('shvat'),
    dayNum: 15,
    category: 'minor_holiday',
    categoryLabel: 'New Year of the Trees',
    isMajorFestival: false,
    durationLabel: '1 Day (15 Shevat)',
    mitzvotSummary: 'Partaking of the Seven Species (Shivat HaMinim) of the Land of Israel; Tachanun is omitted.',
    sefariaRef: 'Mishnah Rosh Hashanah 1:1',
  },
  {
    id: 'purim',
    nameEn: 'Purim',
    nameHe: 'פורים',
    monthMatch: (m) => m.includes('adar') && !m.includes('adar i '),
    dayNum: 14,
    category: 'rabbinic_festival',
    categoryLabel: 'Festival of Deliverance · Megillat Esther',
    isMajorFestival: true,
    durationLabel: '1 Day (14 Adar · Shushan 15 Adar)',
    mitzvotSummary: 'Four Mitzvot: Reading the Megillah (night & day), Mishloach Manot, Matanot La’Evyonim, and Seudat Purim.',
    sefariaRef: 'Esther 9:20-28',
  },
  {
    id: 'pesach',
    nameEn: 'Pesach (Passover)',
    nameHe: 'חג הפסח · זמן חירותנו',
    monthMatch: (m) => m.includes('nisan'),
    dayNum: 15,
    category: 'major_yom_tov',
    categoryLabel: 'Shalosh Regalim · Zman Cheiruteinu',
    isMajorFestival: true,
    durationLabel: '8 Days in Diaspora (15–22 Nisan)',
    mitzvotSummary: 'Leil HaSeder, eating Matzah & Maror, drinking the Four Cups, recounting the Exodus (Haggadah), and Bedikat Chametz.',
    sefariaRef: 'Exodus 12:14-20',
  },
  {
    id: 'lag-baomer',
    nameEn: 'Lag BaOmer',
    nameHe: 'ל״ג בעומר',
    monthMatch: (m) => m.includes('iyar') || m.includes('iyyar'),
    dayNum: 18,
    category: 'minor_holiday',
    categoryLabel: '33rd Day of the Omer · Hillula of Rashbi',
    isMajorFestival: false,
    durationLabel: '1 Day (18 Iyar)',
    mitzvotSummary: 'Celebration of the inner dimension of Torah (Rabbi Shimon bar Yochai) and Ahavat Yisrael.',
    sefariaRef: 'Shabbat 33b',
  },
  {
    id: 'shavuot',
    nameEn: 'Shavuot (Chag HaShavuot)',
    nameHe: 'חג השבועות · זמן מתן תורתנו',
    monthMatch: (m) => m.includes('sivan'),
    dayNum: 6,
    category: 'major_yom_tov',
    categoryLabel: 'Shalosh Regalim · Zman Matan Torateinu',
    isMajorFestival: true,
    durationLabel: '2 Days in Diaspora (6–7 Sivan)',
    mitzvotSummary: 'Tikkun Leil Shavuot all-night Torah study, hearing the Ten Commandments (Aseret HaDibrot), Megillat Ruth, and dairy delicacies.',
    sefariaRef: 'Exodus 19:1-20:23',
  },
  {
    id: 'tisha-bav',
    nameEn: 'Tisha B’Av',
    nameHe: 'תשעה באב',
    monthMatch: (m) => m === 'av',
    dayNum: 9,
    category: 'fast_day',
    categoryLabel: '25-Hour National Fast & Kinot',
    isMajorFestival: false,
    durationLabel: '1 Day (9 Av · Sunset to Nightfall)',
    mitzvotSummary: 'Reading Megillat Eichah and Kinot mourning the First and Second Batei Mikdash.',
    sefariaRef: 'Lamentations 1:1-22',
  },
  {
    id: 'tu-bav',
    nameEn: 'Tu B’Av',
    nameHe: 'ט״ו באב',
    monthMatch: (m) => m === 'av',
    dayNum: 15,
    category: 'minor_holiday',
    categoryLabel: 'Day of Joy & Renewal',
    isMajorFestival: false,
    durationLabel: '1 Day (15 Av)',
    mitzvotSummary: 'Celebrated in the Mishnah as one of the most joyous days on the Jewish calendar; increased Torah study as nights lengthen.',
    sefariaRef: 'Mishnah Taanit 4:8',
  },
];

export function calculateUpcomingJewishHolidays(
  referenceDate: Date,
  location: LocationConfig
): JewishHolidayEvent[] {
  const startNoon = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    12,
    0,
    0
  );

  const results: JewishHolidayEvent[] = [];
  const seenIds = new Set<string>();

  for (let offset = 0; offset <= 385; offset++) {
    const candidate = new Date(startNoon.getTime() + offset * 86400000);
    const parts = parseHebrewDateParts(candidate);
    const monthLower = parts.monthEn.toLowerCase().trim();

    for (const rule of JEWISH_HOLIDAY_RULES) {
      if (
        !seenIds.has(rule.id) &&
        parts.dayNum === rule.dayNum &&
        rule.monthMatch(monthLower)
      ) {
        seenIds.add(rule.id);

        const erevDate = new Date(candidate.getTime() - 86400000);
        const erevSolar = calculateSolarEvents(
          erevDate,
          location.latitude,
          location.longitude
        );
        const dayGematria =
          HEBREW_GEMATRIA_DAYS[parts.dayNum] || String(parts.dayNum);

        results.push({
          id: `${rule.id}-${parts.yearEn}`,
          nameEn: rule.nameEn,
          nameHe: rule.nameHe,
          category: rule.category,
          categoryLabel: rule.categoryLabel,
          hebrewDateLabelEn: `${parts.dayNum} ${parts.monthEn} ${parts.yearEn}`,
          hebrewDateLabelHe: `${dayGematria} ב${parts.monthHe}`,
          startDate: candidate,
          erevDate,
          erevSunsetFormatted: formatTimeInTz(erevSolar.sunset, location.tzid),
          gregorianDateFormatted: candidate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          erevDateFormatted: erevDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          daysRemaining: offset,
          isMajorFestival: rule.isMajorFestival,
          durationLabel: rule.durationLabel,
          mitzvotSummary: rule.mitzvotSummary,
          sefariaRef: rule.sefariaRef,
        });
      }
    }
  }

  return results;
}

