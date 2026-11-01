import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  Info,
  LayoutGrid,
  MapPin,
  Printer,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  LocationConfig,
  ParshaData,
  ShitaOpinion,
  WeatherData,
  ZmanimData,
  LimudItem,
} from '../types/dashboard';
import {
  buildHebrewMonthSolarSeries,
  calculateDafYomiForDate,
  calculateMizrachMetrics,
  getHebrewDateStrings,
  getSolarPositionMetrics,
} from '../services/halachaService';
import { getDailyThoughtsForDateAndParsha } from '../data/dailyThoughts';

interface InfographicViewProps {
  zmanim: ZmanimData;
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  shita: ShitaOpinion;
  onChangeShita: (shita: ShitaOpinion) => void;
  location: LocationConfig;
  parsha: ParshaData | null;
  limud: LimudItem[];
  weather: WeatherData | null;
  onOpenReader: (ref: string, title: string) => void;
  onSwitchToBento: () => void;
}

function getLocalHoursFloat(date: Date, tzid: string): number {
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
    return h + m / 60 + s / 3600;
  } catch {
    return date.getHours() + date.getMinutes() / 60;
  }
}

/**
 * Converts a 24-hour clock value (0..24) into an angle in radians on a 24-hour sundial
 * where 12:00 Noon (Chatzot) is at the top (-PI/2), 06:00 AM is at left (PI),
 * 18:00 PM is at right (0), and 00:00 Midnight is at the bottom (PI/2).
 */
function hourToDialAngleRad(hour24: number): number {
  return ((hour24 - 18) / 24) * 2 * Math.PI;
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeDialArc(
  cx: number,
  cy: number,
  r: number,
  startHour: number,
  endHour: number
): string {
  const startAngle = hourToDialAngleRad(startHour);
  let endAngle = hourToDialAngleRad(endHour);
  if (endAngle < startAngle) {
    endAngle += 2 * Math.PI;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(
    2
  )} ${end.y.toFixed(2)}`;
}

function describeDialSector(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startHour: number,
  endHour: number
): string {
  const startAngle = hourToDialAngleRad(startHour);
  let endAngle = hourToDialAngleRad(endHour);
  if (endAngle < startAngle) {
    endAngle += 2 * Math.PI;
  }
  const p1 = polarToCartesian(cx, cy, outerR, startAngle);
  const p2 = polarToCartesian(cx, cy, outerR, endAngle);
  const p3 = polarToCartesian(cx, cy, innerR, endAngle);
  const p4 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle <= Math.PI ? '0' : '1';
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export const InfographicView: React.FC<InfographicViewProps> = ({
  zmanim,
  selectedDate,
  onChangeDate,
  shita,
  onChangeShita,
  location,
  parsha,
  limud,
  weather,
  onOpenReader,
  onSwitchToBento,
}) => {
  const [selectedPinId, setSelectedPinId] = useState<string>('sunrise');

  const hebrewDate = useMemo(
    () => getHebrewDateStrings(selectedDate),
    [selectedDate]
  );

  const solarMetrics = useMemo(() => {
    const now = new Date();
    const activeInstant = new Date(selectedDate);
    activeInstant.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return getSolarPositionMetrics(
      activeInstant,
      location.latitude,
      location.longitude,
      zmanim.sunrise,
      zmanim.sunset
    );
  }, [selectedDate, location.latitude, location.longitude, zmanim.sunrise, zmanim.sunset]);

  const dafYomi = useMemo(
    () => calculateDafYomiForDate(selectedDate),
    [selectedDate]
  );

  const mizrach = useMemo(
    () => calculateMizrachMetrics(location.latitude, location.longitude),
    [location.latitude, location.longitude]
  );

  const dailyThoughts = useMemo(
    () => getDailyThoughtsForDateAndParsha(selectedDate, parsha?.nameEn),
    [selectedDate, parsha?.nameEn]
  );

  const monthlySeries = useMemo(
    () => buildHebrewMonthSolarSeries(selectedDate, location),
    [selectedDate, location]
  );

  // 24-hour Celestial Dial calculations
  const dialModel = useMemo(() => {
    const findItem = (id: string) => zmanim.items.find((i) => i.id === id);
    const alotHr = getLocalHoursFloat(
      findItem('alot')?.time || new Date(zmanim.sunrise.getTime() - 72 * 60000),
      location.tzid
    );
    const sunriseHr = getLocalHoursFloat(zmanim.sunrise, location.tzid);
    const shemaHr = getLocalHoursFloat(
      findItem(shita === 'MGA' ? 'shema_mga' : 'shema_gra')?.time || zmanim.sunrise,
      location.tzid
    );
    const chatzotHr = getLocalHoursFloat(
      findItem('chatzot')?.time || zmanim.sunrise,
      location.tzid
    );
    const minchaHr = getLocalHoursFloat(
      findItem('mincha_gedolah')?.time || zmanim.sunrise,
      location.tzid
    );
    const plagHr = getLocalHoursFloat(
      findItem('plag')?.time || zmanim.sunset,
      location.tzid
    );
    const sunsetHr = getLocalHoursFloat(zmanim.sunset, location.tzid);
    const tzeitHr = getLocalHoursFloat(
      findItem('tzeit')?.time || new Date(zmanim.sunset.getTime() + 42 * 60000),
      location.tzid
    );
    const rtHr = getLocalHoursFloat(
      findItem('rabbeinu_tam')?.time || new Date(zmanim.sunset.getTime() + 72 * 60000),
      location.tzid
    );
    const nowHr = getLocalHoursFloat(new Date(), location.tzid);

    const pins = zmanim.items.map((item) => {
      const hr = getLocalHoursFloat(item.time, location.tzid);
      const angle = hourToDialAngleRad(hr);
      return {
        item,
        hr,
        angle,
      };
    });

    const daylightMinutes = Math.max(
      1,
      Math.round((zmanim.sunset.getTime() - zmanim.sunrise.getTime()) / 60000)
    );
    const dawnSpanMin = Math.max(1, Math.round((sunriseHr - alotHr) * 60));
    const duskSpanMin = Math.max(1, Math.round((rtHr - sunsetHr) * 60));
    const nightMinutes = Math.max(
      1,
      1440 - daylightMinutes - dawnSpanMin - duskSpanMin
    );

    return {
      alotHr,
      sunriseHr,
      shemaHr,
      chatzotHr,
      minchaHr,
      plagHr,
      sunsetHr,
      tzeitHr,
      rtHr,
      nowHr,
      pins,
      daylightMinutes,
      dawnSpanMin,
      duskSpanMin,
      nightMinutes,
      daylightPct: Math.round((daylightMinutes / 1440) * 1000) / 10,
      twilightPct: Math.round(((dawnSpanMin + duskSpanMin) / 1440) * 1000) / 10,
      nightPct: Math.round((nightMinutes / 1440) * 1000) / 10,
    };
  }, [zmanim, location.tzid, shita]);

  // D3 Daylight Duration Bar / Area Infographic across the Hebrew Month
  const d3DaylightEnvelope = useMemo(() => {
    const days = monthlySeries.days;
    const W = 540;
    const H = 150;
    const L = 42;
    const R = 516;
    const T = 18;
    const B = 122;

    const xScale = d3
      .scaleLinear()
      .domain([1, Math.max(1, days.length)])
      .range([L, R]);

    const minDaylight = (d3.min(days, (d) => d.daylightMinutes) ?? 540) - 8;
    const maxDaylight = (d3.max(days, (d) => d.daylightMinutes) ?? 840) + 8;

    const yScale = d3
      .scaleLinear()
      .domain([minDaylight, maxDaylight])
      .range([B, T]);

    const areaGen = d3
      .area<(typeof days)[0]>()
      .x((d) => xScale(d.hebrewDayNum))
      .y0(B)
      .y1((d) => yScale(d.daylightMinutes))
      .curve(d3.curveMonotoneX);

    const lineGen = d3
      .line<(typeof days)[0]>()
      .x((d) => xScale(d.hebrewDayNum))
      .y((d) => yScale(d.daylightMinutes))
      .curve(d3.curveMonotoneX);

    const ticks = yScale.ticks(4).map((val) => ({
      val,
      y: yScale(val),
      label: `${Math.floor(val / 60)}h ${Math.round(val % 60)}m`,
    }));

    return {
      W,
      H,
      L,
      R,
      T,
      B,
      xScale,
      yScale,
      areaPath: areaGen(days) || '',
      linePath: lineGen(days) || '',
      ticks,
    };
  }, [monthlySeries]);

  // Group Zmanim into 4 liturgical phases for the visual timeline
  const liturgicalPhases = useMemo(() => {
    const byIds = (ids: string[]) =>
      zmanim.items.filter((i) => ids.includes(i.id));

    return [
      {
        id: 'dawn',
        phaseNumber: '01',
        titleEn: 'Shachar & Dawn Awakening',
        titleHe: 'עלות השחר והנץ החמה',
        accentColor: 'border-indigo-500/50 bg-indigo-950/20',
        dotColor: 'bg-indigo-400',
        items: byIds(['alot', 'misheyakir', 'sunrise']),
      },
      {
        id: 'morning',
        phaseNumber: '02',
        titleEn: 'Morning Kriyat Shema & Tefillah',
        titleHe: 'קריאת שמע ותפילת שחרית',
        accentColor: 'border-amber-500/50 bg-amber-950/20',
        dotColor: 'bg-amber-400',
        items: byIds(['shema_mga', 'shema_gra', 'tefillah']),
      },
      {
        id: 'midday',
        phaseNumber: '03',
        titleEn: 'Midday Zenith & Mincha Windows',
        titleHe: 'חצות היום ותפילת מנחה',
        accentColor: 'border-orange-500/50 bg-orange-950/20',
        dotColor: 'bg-orange-400',
        items: byIds(['chatzot', 'mincha_gedolah', 'mincha_ketanah', 'plag']),
      },
      {
        id: 'nightfall',
        phaseNumber: '04',
        titleEn: 'Shkiah, Bein HaShemashot & Nightfall',
        titleHe: 'שקיעה וצאת הכוכבים',
        accentColor: 'border-violet-500/50 bg-violet-950/20',
        dotColor: 'bg-violet-400',
        items: byIds(['candle_lighting', 'sunset', 'tzeit', 'rabbeinu_tam']),
      },
    ];
  }, [zmanim.items]);

  const activePinItem =
    zmanim.items.find((i) => i.id === selectedPinId) || zmanim.items[2] || zmanim.items[0];

  const shiftDays = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  const dafPct = dafYomi.masechetProgressPct;

  return (
    <div className="space-y-6 pb-8">
      {/* INFOGRAPHIC MASTHEAD POSTER HEADER */}
      <div className="rounded-2xl bg-stone-950 text-stone-100 border border-stone-800 p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Celestial Coordinate Watermark Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 20%, rgba(251, 191, 36, 0.35), transparent 45%), radial-gradient(circle at 15% 80%, rgba(99, 102, 241, 0.35), transparent 45%)',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ASTRONOMICAL & HALACHIC CHRONOMETRY BROADSHEET</span>
              <span className="text-stone-600">·</span>
              <span>
                {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
              </span>
              <span className="text-stone-600">·</span>
              <span>{location.tzid}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
                {hebrewDate.he}
              </h2>
              <span className="text-xl sm:text-2xl font-display text-amber-400/90">
                {hebrewDate.en}
              </span>
            </div>

            <p className="text-sm text-stone-400 mt-1 flex flex-wrap items-center gap-2">
              <span>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-200 font-medium">
                {location.name} ({location.hebrewName || location.region})
              </span>
              {parsha && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300 font-medium">
                    {parsha.nameEn} ({parsha.nameHe})
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Infographic Controls: Opinion Switcher, Date Steppers, Print & Bento Switch */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Shita Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-stone-900 border border-stone-800">
              {(
                [
                  { id: 'GRA', label: 'GRA' },
                  { id: 'MGA', label: 'MGA' },
                  { id: 'BAAL_HATANYA', label: 'Baal HaTanya' },
                ] as { id: ShitaOpinion; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeShita(opt.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    shita === opt.id
                      ? 'bg-amber-500 text-stone-950 font-semibold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Day Stepper */}
            <div className="flex items-center p-0.5 rounded-lg bg-stone-900 border border-stone-800">
              <button
                type="button"
                onClick={() => shiftDays(-1)}
                className="p-1.5 text-stone-400 hover:text-white rounded-md"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeDate(new Date())}
                className="px-2.5 py-1 text-xs font-mono text-stone-200 hover:text-amber-400"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftDays(1)}
                className="p-1.5 text-stone-400 hover:text-white rounded-md"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 transition-colors"
              title="Print or Save Infographic as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Broadsheet</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToBento}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bento Grid View</span>
            </button>
          </div>
        </div>

        {/* 6-PILLAR KEY ASTRONOMICAL & TORAH TELEMETRY STRIP */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Alot HaShachar (-16.1°)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-indigo-300 mt-0.5">
              {zmanim.items.find((i) => i.id === 'alot')?.formattedTime || '—'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Dawn Break · עלות השחר</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Netz HaChama (0.0°)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-amber-400 mt-0.5">
              {zmanim.items.find((i) => i.id === 'sunrise')?.formattedTime || '—'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Sea-Level Sunrise · הנץ</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Chatzot Zenith (+{solarMetrics.maxNoonAltitudeDeg.toFixed(1)}°)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-yellow-200 mt-0.5">
              {zmanim.items.find((i) => i.id === 'chatzot')?.formattedTime || '—'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Solar Transit · חצות היום</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Shkiah Horizon (0.0°)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-orange-400 mt-0.5">
              {zmanim.items.find((i) => i.id === 'sunset')?.formattedTime || '—'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Geometric Sunset · שקיעה</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Tzeit HaKochavim (-8.5°)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-violet-300 mt-0.5">
              {zmanim.items.find((i) => i.id === 'tzeit')?.formattedTime || '—'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">3 Medium Stars · צאת הכוכבים</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
            <div className="text-[11px] text-stone-400">Sha’ah Zmanit (GRA / MGA)</div>
            <div className="text-lg font-mono tabular-nums font-bold text-emerald-400 mt-0.5">
              {zmanim.shaahZmanitGraMinutes}m / {zmanim.shaahZmanitMgaMinutes}m
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Daylight: {Math.floor(dialModel.daylightMinutes / 60)}h {dialModel.daylightMinutes % 60}m
            </div>
          </div>
        </div>
      </div>

      {/* SECTION I: 24-HOUR RADIAL CELESTIAL SUNDIAL & PROPORTIONAL DAY ANATOMY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: 24-Hour Radial Astronomical Sundial Infographic */}
        <div className="lg:col-span-7 rounded-2xl bg-stone-950 text-stone-100 border border-stone-800 p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                Fig 01 · 24-Hour Celestial Horizon Rose
              </div>
              <h3 className="text-xl font-semibold text-white mt-0.5">
                Radial Halachic Sundial & Twilight Sectors · מעגל שעות היום והלילה
              </h3>
            </div>
            <div className="text-right font-mono tabular-nums text-xs text-stone-400">
              <div>Noon (Chatzot) at Top · Midnight at Bottom</div>
              <div className="text-amber-300">Click any radial pin to inspect</div>
            </div>
          </div>

          <div className="my-4 flex flex-col sm:flex-row items-center gap-6">
            {/* Radial 24-Hour SVG Dial */}
            <div className="w-full max-w-[330px] mx-auto shrink-0">
              <svg
                viewBox="0 0 340 340"
                className="w-full h-auto select-none overflow-visible"
                role="img"
                aria-label="24-hour radial Halachic sundial mapping daylight, twilight, and night sectors"
              >
                <defs>
                  <radialGradient id="dialCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Background Circle */}
                <circle
                  cx="170"
                  cy="170"
                  r="138"
                  fill="#0c0a09"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.25"
                />
                <circle cx="170" cy="170" r="95" fill="url(#dialCenterGlow)" />

                {/* Night Sector (Full Ring Base) */}
                <circle
                  cx="170"
                  cy="170"
                  r="116"
                  fill="none"
                  stroke="rgba(30, 27, 75, 0.65)"
                  strokeWidth="36"
                />

                {/* Dawn Twilight Sector (Alot -> Sunrise) */}
                <path
                  d={describeDialSector(
                    170,
                    170,
                    98,
                    134,
                    dialModel.alotHr,
                    dialModel.sunriseHr
                  )}
                  fill="rgba(99, 102, 241, 0.42)"
                />

                {/* Full Daylight Sector (Sunrise -> Sunset) */}
                <path
                  d={describeDialSector(
                    170,
                    170,
                    98,
                    134,
                    dialModel.sunriseHr,
                    dialModel.sunsetHr
                  )}
                  fill="rgba(251, 191, 36, 0.25)"
                />

                {/* Morning Shema Golden Sector (Sunrise -> Sof Zman Shema) */}
                <path
                  d={describeDialSector(
                    170,
                    170,
                    104,
                    128,
                    dialModel.sunriseHr,
                    dialModel.shemaHr
                  )}
                  fill="rgba(250, 204, 21, 0.38)"
                />

                {/* Afternoon Mincha Sector (Mincha Gedolah -> Sunset) */}
                <path
                  d={describeDialSector(
                    170,
                    170,
                    104,
                    128,
                    dialModel.minchaHr,
                    dialModel.sunsetHr
                  )}
                  fill="rgba(249, 115, 22, 0.32)"
                />

                {/* Dusk Twilight Sector (Sunset -> Rabbeinu Tam) */}
                <path
                  d={describeDialSector(
                    170,
                    170,
                    98,
                    134,
                    dialModel.sunsetHr,
                    dialModel.rtHr
                  )}
                  fill="rgba(139, 92, 246, 0.42)"
                />

                {/* Luminous Daylight Rim Arc */}
                <path
                  d={describeDialArc(170, 170, 134, dialModel.sunriseHr, dialModel.sunsetHr)}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />

                {/* 24-Hour Clock Perimeter Ticks */}
                {Array.from({ length: 24 }, (_, hr) => {
                  const angle = hourToDialAngleRad(hr);
                  const isMajor = hr % 6 === 0;
                  const pInner = polarToCartesian(170, 170, isMajor ? 136 : 138, angle);
                  const pOuter = polarToCartesian(170, 170, isMajor ? 146 : 142, angle);
                  const pLabel = polarToCartesian(170, 170, 157, angle);
                  const labelText =
                    hr === 0
                      ? '00:00'
                      : hr === 6
                      ? '06:00'
                      : hr === 12
                      ? '12:00'
                      : hr === 18
                      ? '18:00'
                      : `${hr}h`;

                  return (
                    <g key={`hr-tick-${hr}`}>
                      <line
                        x1={pInner.x}
                        y1={pInner.y}
                        x2={pOuter.x}
                        y2={pOuter.y}
                        stroke={isMajor ? '#fbbf24' : 'rgba(255,255,255,0.28)'}
                        strokeWidth={isMajor ? 1.75 : 1}
                      />
                      {hr % 3 === 0 && (
                        <text
                          x={pLabel.x}
                          y={pLabel.y + 3}
                          textAnchor="middle"
                          fill={isMajor ? '#fde68a' : 'rgba(255,255,255,0.45)'}
                          fontSize={isMajor ? '9.5' : '8'}
                          fontWeight={isMajor ? '700' : '500'}
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {labelText}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Plotted Halachic Zmanim Pins Around the Dial */}
                {dialModel.pins.map(({ item, angle }) => {
                  const isActive = activePinItem?.id === item.id;
                  const ptRing = polarToCartesian(170, 170, 116, angle);
                  const ptCenter = polarToCartesian(170, 170, 82, angle);

                  return (
                    <g
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedPinId(item.id)}
                    >
                      <line
                        x1={ptCenter.x}
                        y1={ptCenter.y}
                        x2={ptRing.x}
                        y2={ptRing.y}
                        stroke={isActive ? '#fde047' : 'rgba(255,255,255,0.25)'}
                        strokeWidth={isActive ? 2 : 1}
                      />
                      <circle
                        cx={ptRing.x}
                        cy={ptRing.y}
                        r={isActive ? 5.5 : item.isPrimary ? 4 : 2.8}
                        fill={
                          isActive
                            ? '#fde047'
                            : item.category === 'dawn'
                            ? '#818cf8'
                            : item.category === 'morning'
                            ? '#fbbf24'
                            : item.category === 'midday' || item.category === 'afternoon'
                            ? '#fb923c'
                            : '#c084fc'
                        }
                        stroke="#0c0a09"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

                {/* Current Solar Ray Hand */}
                {(() => {
                  const nowAngle = hourToDialAngleRad(dialModel.nowHr);
                  const rayEnd = polarToCartesian(170, 170, 116, nowAngle);
                  return (
                    <g>
                      <line
                        x1="170"
                        y1="170"
                        x2={rayEnd.x}
                        y2={rayEnd.y}
                        stroke="#f59e0b"
                        strokeWidth="1.75"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={rayEnd.x}
                        cy={rayEnd.y}
                        r="4"
                        fill="#fef08a"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })()}

                {/* Inner Hub Telemetry Readout */}
                <circle
                  cx="170"
                  cy="170"
                  r="64"
                  fill="#141413"
                  stroke="rgba(251, 191, 36, 0.35)"
                  strokeWidth="1.25"
                />
                <text
                  x="170"
                  y="153"
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {activePinItem?.titleHe}
                </text>
                <text
                  x="170"
                  y="173"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {activePinItem?.formattedTime}
                </text>
                <text
                  x="170"
                  y="190"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8.5"
                >
                  {activePinItem?.titleEn.slice(0, 22)}
                </text>
              </svg>
            </div>

            {/* Right Legend & Selected Milestone Inspector */}
            <div className="flex-1 space-y-4 w-full">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
                  <span>Selected Sundial Milestone</span>
                  <span>{activePinItem?.titleHe}</span>
                </div>
                <div className="text-2xl font-mono tabular-nums font-bold text-white mt-1">
                  {activePinItem?.formattedTime}
                </div>
                <div className="text-sm font-semibold text-stone-200 mt-0.5">
                  {activePinItem?.titleEn}
                </div>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  {activePinItem?.halachicNote}
                </p>
              </div>

              {/* 24-Hour Sector Legend */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  24-Hour Cycle Proportion Breakdown
                </div>

                {/* Stacked Proportional Bar */}
                <div className="h-3.5 w-full rounded-full overflow-hidden flex border border-stone-800">
                  <div
                    style={{ width: `${dialModel.daylightPct}%` }}
                    className="bg-amber-400"
                    title={`Daylight: ${dialModel.daylightPct}%`}
                  />
                  <div
                    style={{ width: `${dialModel.twilightPct}%` }}
                    className="bg-indigo-400"
                    title={`Dawn & Dusk Twilight: ${dialModel.twilightPct}%`}
                  />
                  <div
                    style={{ width: `${dialModel.nightPct}%` }}
                    className="bg-stone-800"
                    title={`Night: ${dialModel.nightPct}%`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Daylight</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {Math.floor(dialModel.daylightMinutes / 60)}h {dialModel.daylightMinutes % 60}m
                    </div>
                    <div className="text-[10px] text-stone-500">{dialModel.daylightPct}% of 24h</div>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>Twilight</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {dialModel.dawnSpanMin + dialModel.duskSpanMin}m
                    </div>
                    <div className="text-[10px] text-stone-500">{dialModel.twilightPct}% of 24h</div>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <span className="w-2 h-2 rounded-full bg-stone-600" />
                      <span>Nightfall</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {Math.floor(dialModel.nightMinutes / 60)}h {dialModel.nightMinutes % 60}m
                    </div>
                    <div className="text-[10px] text-stone-500">{dialModel.nightPct}% of 24h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: D3 Monthly Daylight Duration Canyon & Sha'ah Zmanit Curve */}
        <div className="lg:col-span-5 rounded-2xl bg-stone-950 text-stone-100 border border-stone-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 pb-4 border-b border-stone-800">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Fig 02 · Monthly Daylight Curve ({monthlySeries.hebrewMonthNameEn})
                </div>
                <h3 className="text-xl font-semibold text-white mt-0.5">
                  Daylight Span & Sha’ah Zmanit · חודש {monthlySeries.hebrewMonthNameHe}
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-400">
                {monthlySeries.daylightDeltaMinutes >= 0
                  ? `+${monthlySeries.daylightDeltaMinutes}m`
                  : `${monthlySeries.daylightDeltaMinutes}m`}{' '}
                this month
              </span>
            </div>

            {/* D3 Daylight Duration SVG Chart */}
            <div className="mt-4">
              <svg
                viewBox={`0 0 ${d3DaylightEnvelope.W} ${d3DaylightEnvelope.H}`}
                className="w-full h-40 select-none overflow-visible"
                role="img"
                aria-label="D3 area chart of daylight minutes across the Hebrew month"
              >
                <defs>
                  <linearGradient id="daylightCanyonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {d3DaylightEnvelope.ticks.map((tk, idx) => (
                  <g key={idx}>
                    <line
                      x1={d3DaylightEnvelope.L}
                      y1={tk.y}
                      x2={d3DaylightEnvelope.R}
                      y2={tk.y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="2 4"
                    />
                    <text
                      x={d3DaylightEnvelope.L - 6}
                      y={tk.y + 3}
                      textAnchor="end"
                      fill="rgba(251, 191, 36, 0.75)"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {tk.label}
                    </text>
                  </g>
                ))}

                <path d={d3DaylightEnvelope.areaPath} fill="url(#daylightCanyonGrad)" />
                <path
                  d={d3DaylightEnvelope.linePath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.25"
                />

                {monthlySeries.days.map((d) => {
                  const cx = d3DaylightEnvelope.xScale(d.hebrewDayNum);
                  const cy = d3DaylightEnvelope.yScale(d.daylightMinutes);
                  return (
                    <g
                      key={d.ymd}
                      className="cursor-pointer"
                      onClick={() => onChangeDate(d.date)}
                    >
                      {(d.isSelected || d.hebrewDayNum % 5 === 0 || d.hebrewDayNum === 1) && (
                        <>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={d.isSelected ? 5 : 2.5}
                            fill={d.isSelected ? '#fde047' : '#f59e0b'}
                            stroke={d.isSelected ? '#ffffff' : 'none'}
                            strokeWidth={1.5}
                          />
                          <text
                            x={cx}
                            y={d3DaylightEnvelope.B + 15}
                            textAnchor="middle"
                            fill={d.isSelected ? '#fde047' : 'rgba(255,255,255,0.65)'}
                            fontSize="8.5"
                            fontWeight={d.isSelected ? '700' : '500'}
                          >
                            {d.hebrewDayGematria}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Monthly Extremes Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-800 text-xs font-mono tabular-nums">
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800">
              <div className="text-[10px] font-sans text-stone-400">
                1st of {monthlySeries.hebrewMonthNameEn} (א׳)
              </div>
              <div className="text-amber-300 font-semibold mt-0.5">
                Netz: {monthlySeries.days[0]?.sunriseFormatted}
              </div>
              <div className="text-indigo-300 font-semibold">
                Shkiah: {monthlySeries.days[0]?.sunsetFormatted}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                Sha’ah: {monthlySeries.days[0]?.shaahZmanitMin}m
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800">
              <div className="text-[10px] font-sans text-stone-400">
                End of {monthlySeries.hebrewMonthNameEn} (
                {monthlySeries.days[monthlySeries.days.length - 1]?.hebrewDayGematria})
              </div>
              <div className="text-amber-300 font-semibold mt-0.5">
                Netz: {monthlySeries.days[monthlySeries.days.length - 1]?.sunriseFormatted}
              </div>
              <div className="text-indigo-300 font-semibold">
                Shkiah: {monthlySeries.days[monthlySeries.days.length - 1]?.sunsetFormatted}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                Sha’ah: {monthlySeries.days[monthlySeries.days.length - 1]?.shaahZmanitMin}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION II: 4-PHASE VISUAL HALACHIC TIMELINE MATRIX */}
      <div className="rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Fig 03 · Complete Chronological Halachic Matrix
            </div>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              Four Liturgical Gates of the Day · ארבעה שערי היום בהלכה
            </h3>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Calculated according to {shita === 'MGA' ? 'Magen Avraham' : shita === 'BAAL_HATANYA' ? 'Baal HaTanya' : 'Vilna Gaon (GRA)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {liturgicalPhases.map((phase) => (
            <div
              key={phase.id}
              className="rounded-xl p-4 bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-amber-700 dark:text-amber-400">
                  <span>GATE {phase.phaseNumber}</span>
                  <span>{phase.titleHe}</span>
                </div>
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1 pb-2.5 border-b border-stone-200/70 dark:border-stone-800">
                  {phase.titleEn}
                </h4>

                <div className="mt-3 space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-stone-300 dark:before:bg-stone-700">
                  {phase.items.map((item) => (
                    <div key={item.id} className="pl-5 relative">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${phase.dotColor} absolute left-0.5 top-1.5 ring-2 ring-white dark:ring-stone-900`}
                      />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {item.titleEn}
                        </span>
                        <span className="text-xs font-mono tabular-nums font-bold text-amber-800 dark:text-amber-400 shrink-0">
                          {item.formattedTime}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.titleHe} · {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION III: TORAH PARSHA ALIYOT INFOGRAPHIC, DAF YOMI RING & MIZRACH GEODESIC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Weekly Parsha 7-Aliyot Visual Map (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div>
                <div className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Fig 04 · Weekly Torah Portion Architecture
                </div>
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  {parsha?.nameEn || 'Weekly Parsha'} · {parsha?.nameHe}
                </h3>
              </div>
              <div className="text-right font-mono tabular-nums text-xs">
                <div className="text-amber-700 dark:text-amber-400 font-semibold">
                  Candles: {parsha?.candleLighting || '—'}
                </div>
                <div className="text-stone-500">Havdalah: {parsha?.havdalah || '—'}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {parsha?.aliyot.map((aliyah) => (
                <button
                  key={aliyah.num}
                  type="button"
                  onClick={() =>
                    onOpenReader(
                      aliyah.ref,
                      `${parsha.nameEn} · Aliyah ${aliyah.labelEn}`
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900/70 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/60 dark:border-stone-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700/15 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center">
                      {aliyah.num}
                    </span>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {aliyah.labelEn} ({aliyah.labelHe})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                    {aliyah.ref} →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {parsha?.haftarahRef && (
            <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span>Haftorah Portion:</span>
              <span className="font-mono font-medium text-stone-900 dark:text-stone-200">
                {parsha.haftarahRef}
              </span>
            </div>
          )}
        </div>

        {/* Daf Yomi Cycle & Daily Limud Infographic Card (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 p-6 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Fig 05 · Talmud Bavli & Daily Study
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {dafYomi.masechetEn} Daf {dafYomi.dafNum} · {dafYomi.masechetHe}{' '}
                {dafYomi.dafHe}
              </h3>
            </div>

            {/* Radial Progress Gauge for Current Masechet */}
            <div className="my-4 flex items-center gap-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/70 dark:border-stone-800">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="currentColor"
                    className="text-stone-200 dark:text-stone-800"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(dafPct / 100) * 163.36} 163.36`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-stone-900 dark:text-stone-100">
                  {dafPct}%
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Seder {dafYomi.sederEn} · Day #{dafYomi.cycleDayIndex} of {dafYomi.cycleTotalDays}
                </div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  Daf {dafYomi.dafNum} of {dafYomi.masechetTotalDappim}
                </div>
                <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                  {dafYomi.daysUntilSiyumMasechet} days until Siyum {dafYomi.masechetEn}
                </div>
              </div>
            </div>

            {/* Daily Limudim Snapshot */}
            <div className="space-y-1.5">
              {limud.slice(0, 4).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onOpenReader(l.ref, l.titleEn)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/60 text-xs transition-colors"
                >
                  <span className="text-stone-500 dark:text-stone-400">{l.titleEn}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100 truncate ml-2">
                    {l.displayValueEn} →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenReader(
                dafYomi.refAmudA,
                `Daf Yomi · ${dafYomi.masechetEn} ${dafYomi.dafNum}`
              )
            }
            className="mt-4 w-full py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/70 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-amber-100/70 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open {dafYomi.masechetEn} {dafYomi.dafNum}a in Sefaria Reader</span>
          </button>
        </div>

        {/* Mizrach Geodesic Vector & Daily Thought Poster (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Fig 06 · Mizrach Vector & Kavanah
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                Bearing to Jerusalem · מזרח
              </h3>
            </div>

            <div className="mt-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Great-Circle Azimuth</span>
                <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400">
                  {mizrach.greatCircleBearingDeg}° {mizrach.greatCircleCardinal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Rhumb-Line Compass</span>
                <span className="text-xs font-mono font-semibold text-stone-800 dark:text-stone-200">
                  {mizrach.rhumbLineBearingDeg}° {mizrach.rhumbLineCardinal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Distance to Har HaBayit</span>
                <span className="text-xs font-mono text-stone-700 dark:text-stone-300">
                  {mizrach.distanceKm.toLocaleString()} km ({mizrach.distanceMiles.toLocaleString()} mi)
                </span>
              </div>
            </div>

            {/* Calligraphic Daily Thought Box */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Daily Mishnah & Kavanah
              </div>
              <p
                dir="rtl"
                className="text-base font-display font-medium text-stone-900 dark:text-stone-100 leading-snug"
              >
                ”{dailyThoughts.mishnahThought.quoteHe}“
              </p>
              <p className="text-xs italic text-stone-700 dark:text-stone-300 leading-relaxed">
                “{dailyThoughts.mishnahThought.quoteEn}”
              </p>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-amber-200/60 dark:border-amber-800/50">
                {dailyThoughts.mishnahThought.sourceEn} · {dailyThoughts.mishnahThought.sourceHe}
              </div>
            </div>
          </div>

          {weather && (
            <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">Local Sky Conditions:</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                {weather.currentTempF}°F · {weather.conditionText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
