import React, { useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Info,
  RotateCcw,
  Sun,
  TrendingUp,
} from 'lucide-react';
import {
  ZmanimData,
  ZmanItem,
  ShitaOpinion,
  LocationConfig,
} from '../../types/dashboard';
import {
  formatTimeInTz,
  getSolarPositionMetrics,
  buildHebrewMonthSolarSeries,
  formatMinutesFromMidnight,
  HebrewMonthSolarDayPoint,
} from '../../services/halachaService';

interface ZmanimWidgetProps {
  zmanim: ZmanimData;
  selectedDate: Date;
  onChangeDate: (newDate: Date) => void;
  shita: ShitaOpinion;
  onChangeShita: (shita: ShitaOpinion) => void;
  location: LocationConfig;
}

export const ZmanimWidget: React.FC<ZmanimWidgetProps> = ({
  zmanim,
  selectedDate,
  onChangeDate,
  shita,
  onChangeShita,
  location,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [showAllZmanim, setShowAllZmanim] = useState<boolean>(true);
  const [selectedZmanId, setSelectedZmanId] = useState<string | null>(null);
  // Optional interactive time scrubber offset (null = live real-time)
  const [scrubProgress, setScrubProgress] = useState<number | null>(null);
  // Hovered Hebrew day number on the D3 monthly progression chart
  const [hoveredMonthDay, setHoveredMonthDay] = useState<number | null>(null);
  // Visual telemetry view mode: 'split' shows both Daily Arc and D3 Monthly Progression
  const [chartDisplayMode, setChartDisplayMode] = useState<'split' | 'daily' | 'monthly'>('split');

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSelectedToday = useMemo(() => {
    return selectedDate.toDateString() === new Date().toDateString();
  }, [selectedDate]);

  // Window bounds for the solar chart: 45 min before Alot HaShachar to 45 min after Rabbeinu Tam
  const chartBounds = useMemo(() => {
    const alotMs =
      zmanim.items.find((i) => i.id === 'alot')?.time.getTime() ||
      zmanim.sunrise.getTime() - 72 * 60000;
    const rtMs =
      zmanim.items.find((i) => i.id === 'rabbeinu_tam')?.time.getTime() ||
      zmanim.sunset.getTime() + 72 * 60000;
    const startMs = alotMs - 30 * 60000;
    const endMs = rtMs + 30 * 60000;
    return { startMs, endMs, spanMs: Math.max(1, endMs - startMs) };
  }, [zmanim]);

  // Active instant displayed on the SVG arc (either live `now` or scrubbed time)
  const activeInstant = useMemo(() => {
    if (scrubProgress !== null) {
      return new Date(chartBounds.startMs + scrubProgress * chartBounds.spanMs);
    }
    if (!isSelectedToday) {
      // Keep same time of day on the selected date
      const copy = new Date(selectedDate);
      copy.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      return copy;
    }
    return now;
  }, [scrubProgress, chartBounds, isSelectedToday, selectedDate, now]);

  // Determine the next upcoming Zman
  const nextZman = useMemo((): ZmanItem | null => {
    const sorted = [...zmanim.items].sort((a, b) => a.time.getTime() - b.time.getTime());
    const upcoming = sorted.find((item) => item.time.getTime() > now.getTime());
    return upcoming || sorted[0] || null;
  }, [zmanim.items, now]);

  const countdownString = useMemo(() => {
    if (!nextZman || !isSelectedToday) return null;
    const diffMs = nextZman.time.getTime() - now.getTime();
    if (diffMs <= 0) return 'Completed for today';
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  }, [nextZman, now, isSelectedToday]);

  // Real-time astronomical solar metrics (altitude, azimuth, proportional hour)
  const solarMetrics = useMemo(() => {
    return getSolarPositionMetrics(
      activeInstant,
      location.latitude,
      location.longitude,
      zmanim.sunrise,
      zmanim.sunset
    );
  }, [activeInstant, location.latitude, location.longitude, zmanim.sunrise, zmanim.sunset]);

  // Dynamic Day Progression metrics strictly between Sunrise (Netz HaChama) and Sunset (Shkiah)
  const dayProgression = useMemo(() => {
    const sunriseMs = zmanim.sunrise.getTime();
    const sunsetMs = zmanim.sunset.getTime();
    const currentMs = activeInstant.getTime();
    const totalDaylightMs = Math.max(1, sunsetMs - sunriseMs);

    const rawRatio = (currentMs - sunriseMs) / totalDaylightMs;
    const clampedRatio = Math.max(0, Math.min(1, rawRatio));
    const percentExact = Math.round(clampedRatio * 1000) / 10; // e.g. 64.2%

    const formatDurationHm = (ms: number) => {
      const totalMins = Math.max(0, Math.round(ms / 60000));
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
    };

    const totalDaylightFormatted = formatDurationHm(totalDaylightMs);
    const isBeforeSunrise = currentMs < sunriseMs;
    const isAfterSunset = currentMs > sunsetMs;

    const elapsedMs = isBeforeSunrise
      ? 0
      : isAfterSunset
      ? totalDaylightMs
      : currentMs - sunriseMs;
    const remainingMs = isBeforeSunrise
      ? totalDaylightMs
      : isAfterSunset
      ? 0
      : sunsetMs - currentMs;

    const untilSunriseFormatted = isBeforeSunrise
      ? formatDurationHm(sunriseMs - currentMs)
      : null;
    const sinceSunsetFormatted = isAfterSunset
      ? formatDurationHm(currentMs - sunsetMs)
      : null;

    const sunriseFormatted =
      zmanim.items.find((i) => i.id === 'sunrise')?.formattedTime ||
      formatTimeInTz(zmanim.sunrise, location.tzid, false);
    const sunsetFormatted =
      zmanim.items.find((i) => i.id === 'sunset')?.formattedTime ||
      formatTimeInTz(zmanim.sunset, location.tzid, false);
    const chatzotFormatted =
      zmanim.items.find((i) => i.id === 'chatzot')?.formattedTime || '';

    // Key proportional Halachic milestones along the Sunrise -> Sunset span (0% to 100%)
    const milestones = [
      {
        id: 'shema_gra',
        label: 'Shema',
        heLabel: 'שמע',
        shaahLabel: '3h',
        pct: 25,
        time: new Date(sunriseMs + totalDaylightMs * 0.25),
      },
      {
        id: 'tefillah',
        label: 'Tefillah',
        heLabel: 'תפילה',
        shaahLabel: '4h',
        pct: 33.33,
        time: new Date(sunriseMs + totalDaylightMs * (4 / 12)),
      },
      {
        id: 'chatzot',
        label: 'Chatzot',
        heLabel: 'חצות',
        shaahLabel: '6h',
        pct: 50,
        time: new Date(sunriseMs + totalDaylightMs * 0.5),
      },
      {
        id: 'mincha_ketanah',
        label: 'M. Ketanah',
        heLabel: 'מנחה קטנה',
        shaahLabel: '9.5h',
        pct: 79.17,
        time: new Date(sunriseMs + totalDaylightMs * (9.5 / 12)),
      },
      {
        id: 'plag',
        label: 'Plag',
        heLabel: 'פלג',
        shaahLabel: '10.75h',
        pct: 89.58,
        time: new Date(sunriseMs + totalDaylightMs * (10.75 / 12)),
      },
    ];

    return {
      clampedRatio,
      percentExact,
      totalDaylightFormatted,
      elapsedFormatted: formatDurationHm(elapsedMs),
      remainingFormatted: formatDurationHm(remainingMs),
      isBeforeSunrise,
      isAfterSunset,
      untilSunriseFormatted,
      sinceSunsetFormatted,
      sunriseFormatted,
      sunsetFormatted,
      chatzotFormatted,
      milestones,
    };
  }, [activeInstant, zmanim.sunrise, zmanim.sunset, zmanim.items, location.tzid]);

  // Progress along the chart window [0..1]
  const solarArcProgress = useMemo(() => {
    if (scrubProgress !== null) return scrubProgress;
    const raw = (activeInstant.getTime() - chartBounds.startMs) / chartBounds.spanMs;
    return Math.max(0.02, Math.min(0.98, raw));
  }, [scrubProgress, activeInstant, chartBounds]);

  // Normalized t [0..1] for any timestamp on the chart
  const getNormalizedTimeT = (time: Date): number => {
    const raw = (time.getTime() - chartBounds.startMs) / chartBounds.spanMs;
    return Math.max(0.03, Math.min(0.97, raw));
  };

  const sunriseT = useMemo(
    () => getNormalizedTimeT(zmanim.sunrise),
    [zmanim.sunrise, chartBounds]
  );
  const sunsetT = useMemo(
    () => getNormalizedTimeT(zmanim.sunset),
    [zmanim.sunset, chartBounds]
  );

  /**
   * Maps normalized time parameter t in [0..1] to SVG (x, y) coordinates.
   * ViewBox: 0 0 680 215
   * Local Horizon (0° elevation) is fixed at y = 138.
   * Peak Zenith (Chatzot) rises to y = 34.
   * Twilight depression bands extend from y = 138 down to y = 188 (-16.1° Alot).
   */
  const HORIZON_Y = 138;
  const CHART_LEFT = 42;
  const CHART_RIGHT = 638;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

  const getPointOnArc = (t: number): { x: number; y: number; elevationNorm: number } => {
    const x = CHART_LEFT + t * CHART_WIDTH;
    const daySpanT = Math.max(0.1, sunsetT - sunriseT);
    const angle = ((t - sunriseT) / daySpanT) * Math.PI;
    const sinVal = Math.sin(angle); // > 0 between sunriseT and sunsetT, 0 at horizon, < 0 in twilight/night

    // Above horizon: scale up to 102px above HORIZON_Y; Below horizon: scale 48px into twilight band
    const yOffset = sinVal >= 0 ? sinVal * 102 : sinVal * 52;
    const y = Math.max(28, Math.min(186, HORIZON_Y - yOffset));
    return { x, y, elevationNorm: sinVal };
  };

  const sunPoint = getPointOnArc(solarArcProgress);
  const isAboveHorizon = activeInstant.getTime() >= zmanim.sunrise.getTime() &&
    activeInstant.getTime() <= zmanim.sunset.getTime();
  const isGoldenHour =
    Math.abs(solarMetrics.altitudeDeg) <= 6 && solarMetrics.altitudeDeg >= -4;

  // Build SVG path strings: full curve, illuminated progressed curve, and above-horizon daylight area fill
  const { fullArcPath, progressedArcPath, daylightFillPath } = useMemo(() => {
    const steps = 80;
    const fullPts: string[] = [];
    const progPts: string[] = [];
    const dayFillPts: string[] = [];

    const srPt = getPointOnArc(sunriseT);
    const ssPt = getPointOnArc(sunsetT);
    dayFillPts.push(`M ${srPt.x.toFixed(1)} ${HORIZON_Y}`);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = getPointOnArc(t);
      fullPts.push(`${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);

      if (t <= solarArcProgress) {
        progPts.push(`${progPts.length === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      }

      if (t >= sunriseT && t <= sunsetT && t <= solarArcProgress) {
        dayFillPts.push(`L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      }
    }

    // Add exact current sun point to progressed path
    const cur = getPointOnArc(solarArcProgress);
    progPts.push(`L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`);

    if (solarArcProgress >= sunriseT) {
      const clampX = Math.min(cur.x, ssPt.x);
      if (solarArcProgress <= sunsetT) {
        dayFillPts.push(`L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`);
      }
      dayFillPts.push(`L ${clampX.toFixed(1)} ${HORIZON_Y} Z`);
    } else {
      dayFillPts.push(`L ${srPt.x.toFixed(1)} ${HORIZON_Y} Z`);
    }

    return {
      fullArcPath: fullPts.join(' '),
      progressedArcPath: progPts.join(' '),
      daylightFillPath: dayFillPts.join(' '),
    };
  }, [solarArcProgress, sunriseT, sunsetT]);

  // Landmark Zmanim plotted along the curve using their exact computed timestamps
  const arcLandmarks = useMemo(() => {
    const definitions = [
      { id: 'alot', shortLabel: 'Alot' },
      { id: 'misheyakir', shortLabel: 'Misheyakir' },
      { id: 'sunrise', shortLabel: 'Netz' },
      {
        id: shita === 'MGA' ? 'shema_mga' : 'shema_gra',
        shortLabel: 'Shema',
      },
      { id: 'tefillah', shortLabel: 'Tefillah' },
      { id: 'chatzot', shortLabel: 'Chatzot' },
      { id: 'mincha_gedolah', shortLabel: 'M. Gedolah' },
      { id: 'plag', shortLabel: 'Plag' },
      { id: 'sunset', shortLabel: 'Shkiah' },
      { id: 'tzeit', shortLabel: 'Tzeit' },
    ];

    return definitions
      .map((def) => {
        const item = zmanim.items.find((i) => i.id === def.id);
        if (!item) return null;
        const t = getNormalizedTimeT(item.time);
        const pt = getPointOnArc(t);
        return {
          ...def,
          item,
          t,
          pt,
        };
      })
      .filter(Boolean) as {
      id: string;
      shortLabel: string;
      item: ZmanItem;
      t: number;
      pt: { x: number; y: number };
    }[];
  }, [zmanim.items, shita, chartBounds]);

  // 12 Proportional Hours (Sha'ot Zmaniyot) ticks between Sunrise and Sunset
  const shaotTicks = useMemo(() => {
    const ticks = [];
    for (let h = 1; h <= 11; h++) {
      const t = sunriseT + (h / 12) * (sunsetT - sunriseT);
      const x = CHART_LEFT + t * CHART_WIDTH;
      ticks.push({ hour: h, x });
    }
    return ticks;
  }, [sunriseT, sunsetT]);

  // D3-based Hebrew Month Sunrise (Netz HaChama) & Sunset (Shkiah) Progression
  const monthlySeries = useMemo(() => {
    return buildHebrewMonthSolarSeries(selectedDate, location);
  }, [selectedDate, location]);

  const D3_WIDTH = 680;
  const D3_HEIGHT = 188;
  const D3_LEFT = 58;
  const D3_RIGHT = 622;
  const D3_TOP = 24;
  const D3_BOTTOM = 152;

  const d3ChartModel = useMemo(() => {
    const days = monthlySeries.days;
    const totalDays = Math.max(1, days.length);

    const xScale = d3
      .scaleLinear()
      .domain([1, totalDays])
      .range([D3_LEFT, D3_RIGHT]);

    const srExtent = d3.extent(days, (d) => d.sunriseMin) as [number, number];
    const ssExtent = d3.extent(days, (d) => d.sunsetMin) as [number, number];

    const srMin = (srExtent[0] ?? 360) - 3;
    const srMax = (srExtent[1] ?? 420) + 3;
    const ssMin = (ssExtent[0] ?? 1020) - 3;
    const ssMax = (ssExtent[1] ?? 1080) + 3;

    // Earlier times at top of chart, later times toward bottom (or vice-versa; standard chronometry: earlier at top, later lower, or rising up)
    // Mapping earlier time -> higher on axis and later time -> lower on axis (or standard numeric axis):
    // Let's use standard numeric orientation where higher Y-axis = later clock time, with clear formatted labels on both axes.
    const ySunriseScale = d3
      .scaleLinear()
      .domain([srMin, srMax])
      .range([D3_BOTTOM, D3_TOP]);

    const ySunsetScale = d3
      .scaleLinear()
      .domain([ssMin, ssMax])
      .range([D3_BOTTOM, D3_TOP]);

    const sunriseLineGen = d3
      .line<HebrewMonthSolarDayPoint>()
      .x((d) => xScale(d.hebrewDayNum))
      .y((d) => ySunriseScale(d.sunriseMin))
      .curve(d3.curveMonotoneX);

    const sunsetLineGen = d3
      .line<HebrewMonthSolarDayPoint>()
      .x((d) => xScale(d.hebrewDayNum))
      .y((d) => ySunsetScale(d.sunsetMin))
      .curve(d3.curveMonotoneX);

    const sunriseAreaGen = d3
      .area<HebrewMonthSolarDayPoint>()
      .x((d) => xScale(d.hebrewDayNum))
      .y0(D3_BOTTOM)
      .y1((d) => ySunriseScale(d.sunriseMin))
      .curve(d3.curveMonotoneX);

    const sunsetAreaGen = d3
      .area<HebrewMonthSolarDayPoint>()
      .x((d) => xScale(d.hebrewDayNum))
      .y0(D3_BOTTOM)
      .y1((d) => ySunsetScale(d.sunsetMin))
      .curve(d3.curveMonotoneX);

    const sunriseTicks = ySunriseScale.ticks(4).map((val) => ({
      value: val,
      y: ySunriseScale(val),
      label: formatMinutesFromMidnight(val),
    }));

    const sunsetTicks = ySunsetScale.ticks(4).map((val) => ({
      value: val,
      y: ySunsetScale(val),
      label: formatMinutesFromMidnight(val),
    }));

    const xTicks = days.filter(
      (d) =>
        d.hebrewDayNum === 1 ||
        d.hebrewDayNum === 5 ||
        d.hebrewDayNum === 10 ||
        d.hebrewDayNum === 15 ||
        d.hebrewDayNum === 20 ||
        d.hebrewDayNum === 25 ||
        d.hebrewDayNum === days.length
    );

    return {
      xScale,
      ySunriseScale,
      ySunsetScale,
      sunrisePath: sunriseLineGen(days) || '',
      sunsetPath: sunsetLineGen(days) || '',
      sunriseArea: sunriseAreaGen(days) || '',
      sunsetArea: sunsetAreaGen(days) || '',
      sunriseTicks,
      sunsetTicks,
      xTicks,
    };
  }, [monthlySeries]);

  const activeMonthDayPoint = useMemo(() => {
    if (hoveredMonthDay !== null) {
      const found = monthlySeries.days.find((d) => d.hebrewDayNum === hoveredMonthDay);
      if (found) return found;
    }
    return (
      monthlySeries.days.find((d) => d.isSelected) ||
      monthlySeries.days.find((d) => d.isToday) ||
      monthlySeries.days[0] ||
      null
    );
  }, [hoveredMonthDay, monthlySeries.days]);

  const displayedItems = useMemo(() => {
    if (showAllZmanim) return zmanim.items;
    return zmanim.items.filter((i) => i.isPrimary);
  }, [zmanim.items, showAllZmanim]);

  const activeZmanDetail = useMemo(() => {
    if (selectedZmanId) {
      return zmanim.items.find((i) => i.id === selectedZmanId) || nextZman;
    }
    return nextZman;
  }, [selectedZmanId, zmanim.items, nextZman]);

  const shiftDays = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Top Bar Inside Zmanim Widget */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>Halachic Astronomical Clock</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
              <span aria-hidden="true">·</span>
              <span>{zmanim.hebrewDateHe}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Zmanim & Solar Horizon · זמני היום בהלכה
            </h2>
          </div>

          {/* Date Controls & Opinion Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Shita Segmented Selector */}
            <div
              className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700"
              role="group"
              aria-label="Halachic Opinion"
            >
              {(
                [
                  { id: 'GRA', label: 'GRA' },
                  { id: 'MGA', label: 'Magen Avraham' },
                  { id: 'BAAL_HATANYA', label: 'Baal HaTanya' },
                ] as { id: ShitaOpinion; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeShita(opt.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    shita === opt.id
                      ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => shiftDays(-1)}
                title="Previous Day"
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setScrubProgress(null);
                  onChangeDate(new Date());
                }}
                className="px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
              >
                {isSelectedToday
                  ? 'Today'
                  : selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
              </button>
              <button
                type="button"
                onClick={() => shiftDays(1)}
                title="Next Day"
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CELESTIAL SOLAR HORIZON ARC & TELEMETRY CONSOLE */}
        <div className="mt-4 rounded-xl bg-stone-950 text-stone-100 p-4 border border-stone-800 relative overflow-hidden">
          {/* Top Metrics Row */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-stone-800/80">
            <div>
              <div className="text-xs text-stone-400 flex flex-wrap items-center gap-2">
                <span>Next Halachic Milestone</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">
                  {nextZman?.titleEn} ({nextZman?.titleHe})
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums tracking-tight text-white">
                  {nextZman?.formattedTime}
                </span>
                {countdownString && (
                  <span className="text-xs font-mono tabular-nums text-amber-400/90">
                    in {countdownString}
                  </span>
                )}
              </div>
            </div>

            {/* Live Sun Altitude, Azimuth & Proportional Hour Telemetry */}
            <div className="flex flex-wrap items-center gap-5 text-right">
              <div>
                <div className="text-[11px] text-stone-400">Sun Position vs. Horizon</div>
                <div className="text-sm font-mono tabular-nums font-semibold text-amber-400 mt-0.5 flex items-center justify-end gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {solarMetrics.altitudeDeg > 0
                      ? `+${solarMetrics.altitudeDeg.toFixed(1)}° Above`
                      : `${solarMetrics.altitudeDeg.toFixed(1)}° Below`}{' '}
                    · {solarMetrics.azimuthDeg}° {solarMetrics.compassDir}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {solarMetrics.phaseLabel}
                </div>
              </div>

              <div className="pl-4 border-l border-stone-800">
                <div className="text-[11px] text-stone-400">
                  {scrubProgress !== null ? 'Previewed Time' : location.name}
                </div>
                <div className="text-base font-mono tabular-nums font-semibold text-stone-100 mt-0.5">
                  {formatTimeInTz(activeInstant, location.tzid, scrubProgress === null)}
                </div>
                <div className="text-[11px] text-stone-400 font-mono tabular-nums">
                  {solarMetrics.shaahZmanitCurrent !== null
                    ? `Sha’ah ${solarMetrics.shaahZmanitCurrent}/12 · ${zmanim.shaahZmanitGraMinutes}m/hr`
                    : `Sha’ah Zmanit: ${
                        shita === 'MGA'
                          ? `${zmanim.shaahZmanitMgaMinutes}m`
                          : `${zmanim.shaahZmanitGraMinutes}m`
                      }`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Solar Horizon & Altitude Chart */}
          <div className={chartDisplayMode === 'monthly' ? 'hidden' : 'w-full pt-3'}>
            <svg
              viewBox="0 0 680 218"
              className="w-full h-48 sm:h-52 select-none overflow-visible"
              role="img"
              aria-label="Dynamic SVG solar horizon chart displaying live sun elevation relative to the local horizon"
            >
              <defs>
                {/* Full Trajectory Subtle Gradient */}
                <linearGradient id="solarArcFullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="18%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#fde68a" stopOpacity="0.45" />
                  <stop offset="82%" stopColor="#ea580c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
                </linearGradient>

                {/* Active Progressed Path Luminous Gradient */}
                <linearGradient id="solarArcActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
                  <stop offset="18%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
                  <stop offset="85%" stopColor="#f97316" stopOpacity="1" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
                </linearGradient>

                {/* Illuminated Daylight Area Fill Under Progressed Curve */}
                <linearGradient id="daylightDomeFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.26" />
                  <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>

                {/* Radial Glow for Active Sun */}
                <radialGradient id="sunCoronaGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* SKY ELEVATION REFERENCE GRID LINES ABOVE HORIZON */}
              <line
                x1={CHART_LEFT}
                y1="36"
                x2={CHART_RIGHT}
                y2="36"
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2 4"
              />
              <text
                x={CHART_LEFT - 6}
                y="39"
                textAnchor="end"
                fill="rgba(255,255,255,0.35)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                +{ Math.round(solarMetrics.maxNoonAltitudeDeg) }°
              </text>

              <line
                x1={CHART_LEFT}
                y1="87"
                x2={CHART_RIGHT}
                y2="87"
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2 4"
              />
              <text
                x={CHART_LEFT - 6}
                y="90"
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                +{ Math.round(solarMetrics.maxNoonAltitudeDeg / 2) }°
              </text>

              {/* TWILIGHT DEPRESSION BANDS BELOW LOCAL HORIZON (y = 138 to 190) */}
              {/* 0° to -8.5° Bein HaShemashot / Civil-Nautical Twilight */}
              <rect
                x={CHART_LEFT}
                y={HORIZON_Y}
                width={CHART_WIDTH}
                height="26"
                fill="rgba(49, 46, 129, 0.24)"
              />
              {/* -8.5° to -16.1° Alot HaShachar / Astronomical Twilight */}
              <rect
                x={CHART_LEFT}
                y={HORIZON_Y + 26}
                width={CHART_WIDTH}
                height="26"
                fill="rgba(15, 23, 42, 0.55)"
              />
              <line
                x1={CHART_LEFT}
                y1={HORIZON_Y + 26}
                x2={CHART_RIGHT}
                y2={HORIZON_Y + 26}
                stroke="rgba(129, 140, 248, 0.18)"
                strokeDasharray="3 3"
              />
              <text
                x={CHART_LEFT - 6}
                y={HORIZON_Y + 29}
                textAnchor="end"
                fill="rgba(165, 180, 252, 0.45)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                -8.5°
              </text>
              <text
                x={CHART_LEFT - 6}
                y={HORIZON_Y + 53}
                textAnchor="end"
                fill="rgba(165, 180, 252, 0.35)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                -16.1°
              </text>

              {/* 12 SHA'OT ZMANIYOT (PROPORTIONAL HOURS) RULER TICKS ALONG HORIZON */}
              {shaotTicks.map((tk) => (
                <g key={tk.hour}>
                  <line
                    x1={tk.x}
                    y1={HORIZON_Y - 3}
                    x2={tk.x}
                    y2={HORIZON_Y + 3}
                    stroke={
                      tk.hour === 3 || tk.hour === 4 || tk.hour === 6
                        ? 'rgba(251, 191, 36, 0.55)'
                        : 'rgba(255, 255, 255, 0.18)'
                    }
                    strokeWidth={tk.hour === 6 ? '1.5' : '1'}
                  />
                  {(tk.hour === 3 || tk.hour === 4 || tk.hour === 6 || tk.hour === 9) && (
                    <text
                      x={tk.x}
                      y={HORIZON_Y + 13}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.32)"
                      fontSize="7.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {tk.hour}h
                    </text>
                  )}
                </g>
              ))}

              {/* CHAtZOT ZENITH VERTICAL AXIS */}
              <line
                x1={(CHART_LEFT + CHART_RIGHT) / 2}
                y1="26"
                x2={(CHART_LEFT + CHART_RIGHT) / 2}
                y2={HORIZON_Y}
                stroke="rgba(251, 191, 36, 0.18)"
                strokeDasharray="3 3"
              />

              {/* LOCAL 0° HORIZON PLANE LINE */}
              <line
                x1={CHART_LEFT}
                y1={HORIZON_Y}
                x2={CHART_RIGHT}
                y2={HORIZON_Y}
                stroke="rgba(255, 255, 255, 0.38)"
                strokeWidth="1.25"
              />
              <text
                x={CHART_LEFT - 6}
                y={HORIZON_Y + 3}
                textAnchor="end"
                fill="#fbbf24"
                fontSize="9"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                0.0°
              </text>
              <text
                x={CHART_LEFT + 6}
                y={HORIZON_Y - 6}
                fill="rgba(255,255,255,0.45)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                EAST · NETZ HORIZON
              </text>
              <text
                x={CHART_RIGHT - 6}
                y={HORIZON_Y - 6}
                textAnchor="end"
                fill="rgba(255,255,255,0.45)"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                WEST · SHKIAH HORIZON
              </text>

              {/* ILLUMINATED DAYLIGHT DOME FILL (From Sunrise up to Current Sun Position) */}
              <path d={daylightFillPath} fill="url(#daylightDomeFill)" />

              {/* UPCOMING / REMAINING FULL SOLAR TRAJECTORY (Dashed) */}
              <path
                d={fullArcPath}
                fill="none"
                stroke="url(#solarArcFullGrad)"
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />

              {/* PROGRESSED / TRAVERSED SOLAR TRAJECTORY (Solid Luminous) */}
              <path
                d={progressedArcPath}
                fill="none"
                stroke="url(#solarArcActiveGrad)"
                strokeWidth="2.75"
                strokeLinecap="round"
              />

              {/* LANDMARK ZMANIM NODES ALONG THE HORIZON ARC */}
              {arcLandmarks.map((lm, idx) => {
                const isSelected = activeZmanDetail?.id === lm.id;
                const isPassed = activeInstant.getTime() >= lm.item.time.getTime();
                // Stagger label y-offsets slightly on dense morning/afternoon clusters to prevent overlap
                const aboveLabelOffset = idx % 2 === 0 ? -12 : -22;
                const belowLabelOffset = idx % 2 === 0 ? 16 : 26;
                const labelY =
                  lm.pt.y <= HORIZON_Y - 10
                    ? lm.pt.y + aboveLabelOffset
                    : lm.pt.y + belowLabelOffset;

                return (
                  <g
                    key={lm.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedZmanId(lm.id)}
                  >
                    <circle
                      cx={lm.pt.x}
                      cy={lm.pt.y}
                      r={isSelected ? 5 : 3.2}
                      fill={
                        isSelected
                          ? '#fbbf24'
                          : isPassed
                          ? '#f59e0b'
                          : '#0c0a09'
                      }
                      stroke={isSelected ? '#ffffff' : '#fbbf24'}
                      strokeWidth={isSelected ? '1.75' : '1.25'}
                    />
                    <text
                      x={lm.pt.x}
                      y={labelY}
                      textAnchor="middle"
                      fill={
                        isSelected
                          ? '#fde047'
                          : isPassed
                          ? 'rgba(255,255,255,0.85)'
                          : 'rgba(255,255,255,0.52)'
                      }
                      fontSize="9.5"
                      fontWeight={isSelected ? '600' : '500'}
                    >
                      {lm.shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* ACTIVE SUN / MOON VERTICAL ALTITUDE DROP-LINE TO LOCAL HORIZON */}
              <line
                x1={sunPoint.x}
                y1={sunPoint.y}
                x2={sunPoint.x}
                y2={HORIZON_Y}
                stroke={isAboveHorizon ? '#fbbf24' : '#818cf8'}
                strokeWidth="1.25"
                strokeDasharray="2 2"
              />
              {/* Horizon Intersection Anchor Dot */}
              <circle
                cx={sunPoint.x}
                cy={HORIZON_Y}
                r="2.5"
                fill={isAboveHorizon ? '#fbbf24' : '#818cf8'}
              />

              {/* DYNAMIC SUN / TWILIGHT / MOON CELESTIAL BODY */}
              <g transform={`translate(${sunPoint.x}, ${sunPoint.y})`}>
                {/* Outer Corona Halo */}
                <circle
                  r={isAboveHorizon ? '18' : '13'}
                  fill={
                    isAboveHorizon
                      ? 'url(#sunCoronaGlow)'
                      : 'rgba(129, 140, 248, 0.25)'
                  }
                />
                {/* Sun Rays when above horizon */}
                {isAboveHorizon &&
                  [0, 45, 90, 135, 180, 225, 270, 315].map((degAngle) => {
                    const r1 = 8.5;
                    const r2 = 12;
                    const rad = (degAngle * Math.PI) / 180;
                    return (
                      <line
                        key={degAngle}
                        x1={Math.cos(rad) * r1}
                        y1={Math.sin(rad) * r1}
                        x2={Math.cos(rad) * r2}
                        y2={Math.sin(rad) * r2}
                        stroke={isGoldenHour ? '#fb923c' : '#fde047'}
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    );
                  })}
                {/* Core Solar / Lunar Disc */}
                <circle
                  r="6"
                  fill={
                    isAboveHorizon
                      ? isGoldenHour
                        ? '#f97316'
                        : '#facc15'
                      : '#e0e7ff'
                  }
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Live Altitude Angle Callout Tag Attached to Sun Position */}
                <g
                  transform={`translate(${
                    sunPoint.x > 540 ? -42 : sunPoint.x < 130 ? 42 : 0
                  }, ${sunPoint.y < 65 ? 24 : -18})`}
                >
                  <rect
                    x="-36"
                    y="-10"
                    width="72"
                    height="16"
                    rx="4"
                    fill="rgba(12, 10, 9, 0.9)"
                    stroke={
                      isAboveHorizon
                        ? 'rgba(251, 191, 36, 0.65)'
                        : 'rgba(129, 140, 248, 0.65)'
                    }
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill={isAboveHorizon ? '#fde047' : '#c7d2fe'}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {solarMetrics.altitudeDeg > 0
                      ? `+${solarMetrics.altitudeDeg.toFixed(1)}° ALT`
                      : `${solarMetrics.altitudeDeg.toFixed(1)}° ALT`}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* DYNAMIC DAY PROGRESSION BAR (SUNRISE / NETZ HACHAMA → SUNSET / SHKIAH) */}
          <div className="mt-3 pt-3 border-t border-stone-800/90">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-200">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day Progression (Netz → Shkiah)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 font-mono tabular-nums font-semibold text-[11px]">
                  {dayProgression.percentExact.toFixed(1)}% Elapsed
                </span>
                {dayProgression.isBeforeSunrise && (
                  <span className="text-[11px] font-mono tabular-nums text-indigo-300">
                    · Pre-Sunrise (Netz in {dayProgression.untilSunriseFormatted})
                  </span>
                )}
                {dayProgression.isAfterSunset && (
                  <span className="text-[11px] font-mono tabular-nums text-indigo-300">
                    · Daylight Complete (Shkiah +{dayProgression.sinceSunsetFormatted})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tabular-nums text-stone-400">
                <span>
                  Elapsed:{' '}
                  <strong className="text-stone-200 font-semibold">
                    {dayProgression.elapsedFormatted}
                  </strong>
                </span>
                <span className="text-stone-600" aria-hidden="true">
                  ·
                </span>
                <span>
                  Remaining:{' '}
                  <strong className="text-amber-300 font-semibold">
                    {dayProgression.remainingFormatted}
                  </strong>
                </span>
                <span className="text-stone-600" aria-hidden="true">
                  ·
                </span>
                <span>
                  Total Daylight:{' '}
                  <strong className="text-stone-300 font-semibold">
                    {dayProgression.totalDaylightFormatted}
                  </strong>
                </span>
              </div>
            </div>

            {/* Interactive Visual Progress Track with 12 Sha'ot Zmaniyot Ticks & Halachic Milestones */}
            <div
              className="relative h-3.5 w-full rounded-full bg-stone-900 border border-stone-800 overflow-visible cursor-pointer group/daybar select-none"
              role="progressbar"
              aria-label="Daylight progression from sunrise to sunset"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(dayProgression.percentExact)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickRatio = Math.max(
                  0,
                  Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))
                );
                const targetTimeMs =
                  zmanim.sunrise.getTime() +
                  clickRatio *
                    (zmanim.sunset.getTime() - zmanim.sunrise.getTime());
                setScrubProgress(getNormalizedTimeT(new Date(targetTimeMs)));
              }}
              title="Click anywhere along the Sunrise-to-Sunset bar to inspect that daylight moment"
            >
              {/* 12 Proportional Hours (Sha'ot Zmaniyot) Subtle Subdivision Lines */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hr) => (
                  <div
                    key={hr}
                    style={{ left: `${(hr / 12) * 100}%` }}
                    className={`absolute top-0 bottom-0 w-px ${
                      hr === 6
                        ? 'bg-amber-300/45'
                        : hr === 3 || hr === 4 || hr === 9
                        ? 'bg-stone-600/75'
                        : 'bg-stone-800/90'
                    }`}
                  />
                ))}

                {/* Illuminated Daylight Fill Bar */}
                <div
                  style={{ width: `${dayProgression.clampedRatio * 100}%` }}
                  className="h-full rounded-l-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-[width] duration-300 relative"
                />
              </div>

              {/* Milestone Tick Dots along the Bar (Shema 25%, Tefillah 33.3%, Chatzot 50%, M. Ketanah 79.2%, Plag 89.6%) */}
              {dayProgression.milestones.map((ms) => {
                const isReached =
                  dayProgression.percentExact >= ms.pct - 0.2;
                return (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelectedZmanId(ms.id);
                      setScrubProgress(getNormalizedTimeT(ms.time));
                    }}
                    style={{ left: `${ms.pct}%` }}
                    title={`${ms.label} (${ms.heLabel}) · ${ms.shaahLabel} Sha'ah Zmanit (${Math.round(
                      ms.pct
                    )}% of day)`}
                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border transition-transform hover:scale-125 z-10 ${
                      isReached
                        ? 'bg-stone-950 border-yellow-200'
                        : 'bg-stone-800 border-stone-500 hover:border-amber-400'
                    }`}
                  />
                );
              })}

              {/* Glowing Active Sun Progress Indicator Thumb */}
              <div
                style={{ left: `${dayProgression.clampedRatio * 100}%` }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_10px_rgba(251,191,36,0.95)] pointer-events-none z-20 transition-[left] duration-300"
              />
            </div>

            {/* Sunrise, Proportional Milestones & Sunset Timestamp Labels Below Track */}
            <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] font-mono tabular-nums text-stone-400">
              <button
                type="button"
                onClick={() => {
                  setSelectedZmanId('sunrise');
                  setScrubProgress(getNormalizedTimeT(zmanim.sunrise));
                }}
                className="text-left hover:text-amber-300 transition-colors"
              >
                <span className="text-amber-400 font-semibold">0% Netz</span> ·{' '}
                {dayProgression.sunriseFormatted}
              </button>

              <div className="hidden sm:flex items-center gap-3 text-stone-400">
                {dayProgression.milestones.map((ms) => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => {
                      setSelectedZmanId(ms.id);
                      setScrubProgress(getNormalizedTimeT(ms.time));
                    }}
                    className={`hover:text-amber-300 transition-colors ${
                      selectedZmanId === ms.id ? 'text-amber-300 font-semibold' : ''
                    }`}
                  >
                    {ms.label} ({Math.round(ms.pct)}%)
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedZmanId('sunset');
                  setScrubProgress(getNormalizedTimeT(zmanim.sunset));
                }}
                className="text-right hover:text-indigo-300 transition-colors"
              >
                <span className="text-indigo-300 font-semibold">100% Shkiah</span> ·{' '}
                {dayProgression.sunsetFormatted}
              </button>
            </div>
          </div>

          {/* Interactive Time Scrubber & Chart Mode Controls */}
          <div className="mt-2.5 pt-2.5 border-t border-stone-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <label
                htmlFor="solar-time-scrubber"
                className="text-[11px] text-stone-400 whitespace-nowrap"
              >
                Interactive Horizon Scrubber:
              </label>
              <input
                id="solar-time-scrubber"
                type="range"
                min={0.02}
                max={0.98}
                step={0.005}
                value={solarArcProgress}
                onChange={(e) => setScrubProgress(parseFloat(e.target.value))}
                className="w-full max-w-xs accent-amber-400 h-1 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tabular-nums text-stone-400">
              {scrubProgress !== null && (
                <button
                  type="button"
                  onClick={() => setScrubProgress(null)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-sans font-medium transition-colors whitespace-nowrap"
                >
                  Reset to Live Sun
                </button>
              )}
              <div
                className="flex items-center p-0.5 rounded-md bg-stone-900 border border-stone-800 font-sans"
                role="group"
                aria-label="Chart Display Mode"
              >
                {(
                  [
                    { id: 'split', label: 'Arc + Monthly D3' },
                    { id: 'daily', label: 'Daily Arc Only' },
                    { id: 'monthly', label: 'Monthly D3 Focus' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setChartDisplayMode(mode.id)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors whitespace-nowrap ${
                      chartDisplayMode === mode.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* D3-BASED HEBREW MONTH SUNRISE (NETZ) & SUNSET (SHKIAH) PROGRESSION CHART */}
          {chartDisplayMode !== 'daily' && (
            <div className="mt-3 pt-3 border-t border-stone-800/90">
              {/* Header & Hovered Day Telemetry Readout */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-medium text-stone-200">
                    Monthly Solar Progression · חודש {monthlySeries.hebrewMonthNameHe} (
                    {monthlySeries.hebrewMonthNameEn} {monthlySeries.hebrewYearEn})
                  </span>
                  <span className="text-stone-500" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-stone-400">
                    Netz Shift:{' '}
                    <span className="text-amber-300">
                      {monthlySeries.sunriseShiftMinutes > 0
                        ? `+${monthlySeries.sunriseShiftMinutes}m`
                        : `${monthlySeries.sunriseShiftMinutes}m`}
                    </span>{' '}
                    · Shkiah Shift:{' '}
                    <span className="text-indigo-300">
                      {monthlySeries.sunsetShiftMinutes > 0
                        ? `+${monthlySeries.sunsetShiftMinutes}m`
                        : `${monthlySeries.sunsetShiftMinutes}m`}
                    </span>{' '}
                    · Daylight Δ:{' '}
                    <span
                      className={
                        monthlySeries.daylightDeltaMinutes >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {monthlySeries.daylightDeltaMinutes > 0
                        ? `+${monthlySeries.daylightDeltaMinutes}m`
                        : `${monthlySeries.daylightDeltaMinutes}m`}
                    </span>
                  </span>
                </div>

                {/* Hovered / Selected Hebrew Day Telemetry */}
                {activeMonthDayPoint && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tabular-nums bg-stone-900/90 border border-stone-800 px-2.5 py-1 rounded-md">
                    <span className="text-stone-300 font-sans font-medium">
                      {activeMonthDayPoint.hebrewDayGematria} {monthlySeries.hebrewMonthNameHe} (
                      {activeMonthDayPoint.gregorianLabel})
                    </span>
                    <span className="text-amber-400">
                      Netz: {activeMonthDayPoint.sunriseFormatted}
                    </span>
                    <span className="text-indigo-300">
                      Shkiah: {activeMonthDayPoint.sunsetFormatted}
                    </span>
                    <span className="text-stone-400">
                      Sha’ah: {activeMonthDayPoint.shaahZmanitMin}m
                    </span>
                  </div>
                )}
              </div>

              {/* D3 Line & Area SVG Chart */}
              <div className="w-full">
                <svg
                  viewBox={`0 0 ${D3_WIDTH} ${D3_HEIGHT}`}
                  className={`w-full ${
                    chartDisplayMode === 'monthly' ? 'h-52 sm:h-60' : 'h-40 sm:h-44'
                  } select-none overflow-visible`}
                  role="img"
                  aria-label={`D3 line chart mapping sunrise and sunset progression throughout ${monthlySeries.hebrewMonthNameEn}`}
                  onMouseLeave={() => setHoveredMonthDay(null)}
                >
                  <defs>
                    <linearGradient id="d3SunriseAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="d3SunsetAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Left Axis Title (Sunrise / Netz HaChama) */}
                  <text
                    x={D3_LEFT - 6}
                    y={13}
                    textAnchor="end"
                    fill="#fbbf24"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    NETZ (AM)
                  </text>

                  {/* Right Axis Title (Sunset / Shkiah) */}
                  <text
                    x={D3_RIGHT + 6}
                    y={13}
                    textAnchor="start"
                    fill="#a5b4fc"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    SHKIAH (PM)
                  </text>

                  {/* Horizontal Reference Grid Lines & Left Y-Axis Ticks (Sunrise) */}
                  {d3ChartModel.sunriseTicks.map((tk, i) => (
                    <g key={`sr-tick-${i}`}>
                      <line
                        x1={D3_LEFT}
                        y1={tk.y}
                        x2={D3_RIGHT}
                        y2={tk.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="2 4"
                      />
                      <text
                        x={D3_LEFT - 6}
                        y={tk.y + 3}
                        textAnchor="end"
                        fill="rgba(251, 191, 36, 0.8)"
                        fontSize="8.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {tk.label.replace(' AM', '')}
                      </text>
                    </g>
                  ))}

                  {/* Right Y-Axis Ticks (Sunset) */}
                  {d3ChartModel.sunsetTicks.map((tk, i) => (
                    <g key={`ss-tick-${i}`}>
                      <text
                        x={D3_RIGHT + 6}
                        y={tk.y + 3}
                        textAnchor="start"
                        fill="rgba(165, 180, 252, 0.85)"
                        fontSize="8.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {tk.label.replace(' PM', '')}
                      </text>
                    </g>
                  ))}

                  {/* Shabbat Vertical Reference Columns */}
                  {monthlySeries.days
                    .filter((d) => d.isShabbat)
                    .map((shabbatDay) => {
                      const cx = d3ChartModel.xScale(shabbatDay.hebrewDayNum);
                      return (
                        <g key={`shabbat-col-${shabbatDay.hebrewDayNum}`}>
                          <line
                            x1={cx}
                            y1={D3_TOP}
                            x2={cx}
                            y2={D3_BOTTOM}
                            stroke="rgba(251, 191, 36, 0.14)"
                            strokeWidth="6"
                          />
                        </g>
                      );
                    })}

                  {/* D3 Area Fills Under Sunrise & Sunset Curves */}
                  <path d={d3ChartModel.sunriseArea} fill="url(#d3SunriseAreaGrad)" />
                  <path d={d3ChartModel.sunsetArea} fill="url(#d3SunsetAreaGrad)" />

                  {/* D3 Monotone Cubic Spline Curve: Sunrise (Netz HaChama) */}
                  <path
                    d={d3ChartModel.sunrisePath}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />

                  {/* D3 Monotone Cubic Spline Curve: Sunset (Shkiah) */}
                  <path
                    d={d3ChartModel.sunsetPath}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />

                  {/* Bottom X-Axis Baseline */}
                  <line
                    x1={D3_LEFT}
                    y1={D3_BOTTOM}
                    x2={D3_RIGHT}
                    y2={D3_BOTTOM}
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="1"
                  />

                  {/* X-Axis Hebrew Date Gematria & Gregorian Sub-labels */}
                  {d3ChartModel.xTicks.map((dayPt) => {
                    const cx = d3ChartModel.xScale(dayPt.hebrewDayNum);
                    return (
                      <g key={`x-tick-${dayPt.hebrewDayNum}`}>
                        <line
                          x1={cx}
                          y1={D3_BOTTOM}
                          x2={cx}
                          y2={D3_BOTTOM + 4}
                          stroke="rgba(255,255,255,0.35)"
                        />
                        <text
                          x={cx}
                          y={D3_BOTTOM + 14}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.78)"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {dayPt.hebrewDayGematria}
                        </text>
                        <text
                          x={cx}
                          y={D3_BOTTOM + 25}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.42)"
                          fontSize="7.5"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {dayPt.gregorianLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Active / Hovered Day Vertical Crosshair Line */}
                  {activeMonthDayPoint && (
                    <line
                      x1={d3ChartModel.xScale(activeMonthDayPoint.hebrewDayNum)}
                      y1={D3_TOP - 4}
                      x2={d3ChartModel.xScale(activeMonthDayPoint.hebrewDayNum)}
                      y2={D3_BOTTOM}
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="1.25"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Interactive Daily Data Nodes & Hover/Click Targets */}
                  {monthlySeries.days.map((dayPt) => {
                    const cx = d3ChartModel.xScale(dayPt.hebrewDayNum);
                    const srY = d3ChartModel.ySunriseScale(dayPt.sunriseMin);
                    const ssY = d3ChartModel.ySunsetScale(dayPt.sunsetMin);
                    const isHighlighted =
                      activeMonthDayPoint?.hebrewDayNum === dayPt.hebrewDayNum;
                    const colWidth =
                      (D3_RIGHT - D3_LEFT) / Math.max(1, monthlySeries.days.length);

                    return (
                      <g
                        key={dayPt.ymd}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthDay(dayPt.hebrewDayNum)}
                        onClick={() => {
                          setScrubProgress(null);
                          onChangeDate(dayPt.date);
                        }}
                      >
                        {/* Sunrise Point */}
                        <circle
                          cx={cx}
                          cy={srY}
                          r={isHighlighted ? 4.5 : dayPt.isSelected || dayPt.isToday ? 3.5 : 2}
                          fill={isHighlighted || dayPt.isSelected ? '#fde047' : '#f59e0b'}
                          stroke={isHighlighted || dayPt.isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isHighlighted || dayPt.isSelected ? 1.5 : 0}
                        />

                        {/* Sunset Point */}
                        <circle
                          cx={cx}
                          cy={ssY}
                          r={isHighlighted ? 4.5 : dayPt.isSelected || dayPt.isToday ? 3.5 : 2}
                          fill={isHighlighted || dayPt.isSelected ? '#c7d2fe' : '#818cf8'}
                          stroke={isHighlighted || dayPt.isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isHighlighted || dayPt.isSelected ? 1.5 : 0}
                        />

                        {/* Invisible Full-Height Hit Column for Smooth Hover & Click */}
                        <rect
                          x={cx - colWidth / 2}
                          y={D3_TOP - 6}
                          width={colWidth}
                          height={D3_BOTTOM - D3_TOP + 16}
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend & Click Instruction Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-[11px] text-stone-400">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-amber-400 rounded-full inline-block" />
                    <span className="text-amber-300/90 font-medium">
                      Netz HaChama (Sunrise Curve)
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-indigo-400 rounded-full inline-block" />
                    <span className="text-indigo-300/90 font-medium">
                      Shkiah (Sunset Curve)
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-400/20 border border-amber-400/40 inline-block" />
                    <span>Shabbat Kodesh</span>
                  </span>
                </div>
                <span className="text-stone-400">
                  Hover any day to inspect · Click any point to jump Zmanim to that Hebrew date
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar: All 14 Zmanim vs Essential 6 */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>Click any Zman row or arc node to inspect its Halachic calculation</span>
          </div>
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-lg border border-stone-200/70 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setShowAllZmanim(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                showAllZmanim
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Complete Schedule ({zmanim.items.length})
            </button>
            <button
              type="button"
              onClick={() => setShowAllZmanim(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !showAllZmanim
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Essential (6)
            </button>
          </div>
        </div>

        {/* High-Density 2-Column Zmanim Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 border-t border-stone-200/80 dark:border-stone-800 pt-2">
          {displayedItems.map((item) => {
            const isPast = isSelectedToday && item.time.getTime() < now.getTime();
            const isNext = isSelectedToday && nextZman?.id === item.id;
            const isSelected = activeZmanDetail?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedZmanId(item.id);
                  setScrubProgress(getNormalizedTimeT(item.time));
                }}
                className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left transition-colors border ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-800/70'
                    : isNext
                    ? 'bg-stone-100/90 dark:bg-stone-800/70 border-stone-300/70 dark:border-stone-700'
                    : 'border-transparent hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${
                        isPast && !isSelected
                          ? 'text-stone-500 dark:text-stone-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {item.titleEn}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                      · {item.titleHe}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    {item.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-mono tabular-nums font-semibold ${
                      isNext
                        ? 'text-amber-700 dark:text-amber-400'
                        : isPast && !isSelected
                        ? 'text-stone-500 dark:text-stone-400'
                        : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {item.formattedTime}
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500">
                    {isNext ? 'Next Zman' : isPast ? 'Passed' : 'Upcoming'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zman Halachic Inspector Footer */}
      {activeZmanDetail && (
        <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="text-stone-900 dark:text-stone-200 font-medium">
                {activeZmanDetail.titleEn} ({activeZmanDetail.formattedTime}):
              </strong>{' '}
              {activeZmanDetail.halachicNote}
            </span>
          </div>
          {(!isSelectedToday || scrubProgress !== null) && (
            <button
              type="button"
              onClick={() => {
                setScrubProgress(null);
                onChangeDate(new Date());
              }}
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Return to Live Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};
