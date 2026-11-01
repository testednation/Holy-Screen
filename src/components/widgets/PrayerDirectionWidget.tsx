import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Compass, LocateFixed, Navigation, RotateCcw } from 'lucide-react';
import { LocationConfig } from '../../types/dashboard';
import { calculateMizrachMetrics } from '../../services/halachaService';

interface PrayerDirectionWidgetProps {
  location: LocationConfig;
  onUpdateLocation?: (loc: LocationConfig) => void;
}

export const PrayerDirectionWidget: React.FC<PrayerDirectionWidgetProps> = ({
  location,
  onUpdateLocation,
}) => {
  const [bearingMode, setBearingMode] = useState<'great_circle' | 'rhumb'>(
    'great_circle'
  );
  // Device compass heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorStatus, setSensorStatus] = useState<
    'standby' | 'active' | 'unsupported' | 'denied'
  >('standby');
  const [gpsUpdating, setGpsUpdating] = useState<boolean>(false);

  const mizrach = useMemo(
    () => calculateMizrachMetrics(location.latitude, location.longitude),
    [location.latitude, location.longitude]
  );

  const targetBearing =
    bearingMode === 'great_circle'
      ? mizrach.greatCircleBearingDeg
      : mizrach.rhumbLineBearingDeg;

  const targetCardinal =
    bearingMode === 'great_circle'
      ? mizrach.greatCircleCardinal
      : mizrach.rhumbLineCardinal;

  // Handle orientation event from browser sensor API
  const handleOrientationEvent = useCallback((event: any) => {
    let heading: number | null = null;

    if (typeof event.webkitCompassHeading === 'number') {
      // iOS Safari magnetometer heading
      heading = event.webkitCompassHeading;
    } else if (event.absolute === true && typeof event.alpha === 'number') {
      // Android Chrome absolute deviceorientation
      heading = (360 - event.alpha) % 360;
    } else if (typeof event.alpha === 'number') {
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(Math.round(((heading % 360) + 360) % 360));
      setSensorStatus('active');
    }
  }, []);

  useEffect(() => {
    const win = window as any;
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setSensorStatus('unsupported');
      return;
    }

    // Automatically attach if permission prompt is not required
    if (typeof win.DeviceOrientationEvent?.requestPermission !== 'function') {
      window.addEventListener(
        'deviceorientationabsolute',
        handleOrientationEvent as EventListener,
        true
      );
      window.addEventListener(
        'deviceorientation',
        handleOrientationEvent as EventListener,
        true
      );
    }

    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientationEvent as EventListener,
        true
      );
      window.removeEventListener(
        'deviceorientation',
        handleOrientationEvent as EventListener,
        true
      );
    };
  }, [handleOrientationEvent]);

  const requestSensorPermission = async () => {
    const win = window as any;
    if (typeof win.DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const res = await win.DeviceOrientationEvent.requestPermission();
        if (res === 'granted') {
          window.addEventListener(
            'deviceorientation',
            handleOrientationEvent as EventListener,
            true
          );
          setSensorStatus('active');
        } else {
          setSensorStatus('denied');
        }
      } catch {
        setSensorStatus('denied');
      }
    } else {
      window.addEventListener(
        'deviceorientationabsolute',
        handleOrientationEvent as EventListener,
        true
      );
      window.addEventListener(
        'deviceorientation',
        handleOrientationEvent as EventListener,
        true
      );
    }
  };

  const handleRequestGps = () => {
    if (!navigator.geolocation || !onUpdateLocation) return;
    setGpsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz =
          Intl.DateTimeFormat().resolvedOptions().timeZone || location.tzid;
        onUpdateLocation({
          id: 'gps-current',
          name: 'Current GPS Coordinates',
          hebrewName: 'מיקום GPS נוכחי',
          region: `${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(
            3
          )}°E`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          tzid: tz,
          candleLightingMinutes: tz === 'Asia/Jerusalem' ? 40 : 18,
        });
        setGpsUpdating(false);
      },
      () => {
        setGpsUpdating(false);
      },
      { timeout: 8000 }
    );
  };

  // Relative angle of Jerusalem pointer vs. current device top lubber line
  const relativeJerusalemAngle = useMemo(() => {
    return ((targetBearing - deviceHeading) % 360 + 360) % 360;
  }, [targetBearing, deviceHeading]);

  //Shortest angular delta [-180..180]
  const angularDelta = useMemo(() => {
    const diff = ((targetBearing - deviceHeading + 540) % 360) - 180;
    return Math.round(diff * 10) / 10;
  }, [targetBearing, deviceHeading]);

  const isAlignedWithJerusalem = Math.abs(angularDelta) <= 5;

  // Generate 72 ticks around the compass dial (every 5 degrees)
  const dialTicks = useMemo(() => {
    const arr = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      arr.push({ deg, isCardinal, isMajor });
    }
    return arr;
  }, []);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Mizrach · Har HaBayit</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {mizrach.distanceMiles.toLocaleString()} mi (
                {mizrach.distanceKm.toLocaleString()} km)
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Direction of Prayer · כיוון התפילה
            </h2>
          </div>

          {/* Shita / Geodesic vs Rhumb Selector */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700"
            role="group"
            aria-label="Mizrach Bearing Calculation Method"
          >
            <button
              type="button"
              onClick={() => setBearingMode('great_circle')}
              title="Shortest spherical path (Geodesic / Iggerot Moshe)"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                bearingMode === 'great_circle'
                  ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Great Circle
            </button>
            <button
              type="button"
              onClick={() => setBearingMode('rhumb')}
              title="Constant compass line (Loxodromic / Levush)"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                bearingMode === 'rhumb'
                  ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Rhumb Line
            </button>
          </div>
        </div>

        {/* Bearing Readout & Alignment Status Strip */}
        <div className="py-2.5 px-3 mt-3 rounded-xl bg-stone-950 text-stone-100 border border-stone-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-stone-400">
              Jerusalem Bearing ({location.name})
            </div>
            <div className="text-lg font-mono tabular-nums font-semibold text-amber-400">
              {targetBearing.toFixed(1)}° {targetCardinal}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-stone-400">Device Heading</div>
            <div
              className={`text-sm font-mono tabular-nums font-semibold ${
                isAlignedWithJerusalem ? 'text-emerald-400' : 'text-stone-200'
              }`}
            >
              {deviceHeading}° ·{' '}
              {isAlignedWithJerusalem
                ? 'Facing Jerusalem ✓'
                : angularDelta > 0
                ? `Turn ${Math.abs(angularDelta)}° Right`
                : `Turn ${Math.abs(angularDelta)}° Left`}
            </div>
          </div>
        </div>

        {/* Interactive SVG Compass Rose & Jerusalem Pointer */}
        <div className="my-3 flex flex-col items-center justify-center relative">
          <svg
            viewBox="0 0 240 240"
            className="w-48 h-48 sm:w-52 sm:h-52 select-none overflow-visible"
            role="img"
            aria-label={`Compass pointing toward Jerusalem at ${targetBearing} degrees ${targetCardinal}`}
          >
            <defs>
              <radialGradient id="compassDialBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1c1917" />
                <stop offset="100%" stopColor="#0c0a09" />
              </radialGradient>
            </defs>

            {/* Fixed Top Lubber Line (Device Forward Direction Marker) */}
            <polygon
              points="120,4 114,15 126,15"
              fill={isAlignedWithJerusalem ? '#10b981' : '#f59e0b'}
            />

            {/* Outer Bezel Ring */}
            <circle
              cx="120"
              cy="120"
              r="102"
              fill="url(#compassDialBg)"
              stroke={
                isAlignedWithJerusalem
                  ? 'rgba(16, 185, 129, 0.75)'
                  : 'rgba(251, 191, 36, 0.35)'
              }
              strokeWidth="2"
            />
            <circle
              cx="120"
              cy="120"
              r="95"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />

            {/* ROTATING COMPASS CARD (Rotates by -deviceHeading so North matches physical North) */}
            <g transform={`rotate(${-deviceHeading} 120 120)`}>
              {/* 5-degree & 30-degree Dial Ticks */}
              {dialTicks.map(({ deg, isCardinal, isMajor }) => (
                <line
                  key={deg}
                  x1="120"
                  y1={isCardinal ? '22' : isMajor ? '24' : '26'}
                  x2="120"
                  y2={isCardinal ? '33' : isMajor ? '31' : '29'}
                  stroke={
                    deg === 0
                      ? '#ef4444'
                      : isCardinal
                      ? '#fbbf24'
                      : isMajor
                      ? 'rgba(255,255,255,0.55)'
                      : 'rgba(255,255,255,0.22)'
                  }
                  strokeWidth={isCardinal ? '2' : isMajor ? '1.25' : '0.8'}
                  transform={`rotate(${deg} 120 120)`}
                />
              ))}

              {/* Cardinal Letters (N, E, S, W + Hebrew) */}
              <text
                x="120"
                y="45"
                textAnchor="middle"
                fill="#f87171"
                fontSize="11"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                N · צ
              </text>
              <text
                x="198"
                y="124"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="10.5"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                E · מ
              </text>
              <text
                x="120"
                y="203"
                textAnchor="middle"
                fill="rgba(255,255,255,0.75)"
                fontSize="10.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                S · ד
              </text>
              <text
                x="42"
                y="124"
                textAnchor="middle"
                fill="rgba(255,255,255,0.75)"
                fontSize="10.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                W
              </text>

              {/* JERUSALEM MIZRACH TARGET MARKER ON BEZEL (at targetBearing) */}
              <g transform={`rotate(${targetBearing} 120 120)`}>
                {/* Dashed Guiding Ray from Center to Har HaBayit Bearing */}
                <line
                  x1="120"
                  y1="120"
                  x2="120"
                  y2="26"
                  stroke={isAlignedWithJerusalem ? '#34d399' : '#fbbf24'}
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                {/* Golden Mizrach Spearhead Needle */}
                <polygon
                  points="120,24 113,56 120,49 127,56"
                  fill={isAlignedWithJerusalem ? '#10b981' : '#fbbf24'}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* Tail Counterweight */}
                <line
                  x1="120"
                  y1="120"
                  x2="120"
                  y2="162"
                  stroke="rgba(251, 191, 36, 0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Label on Needle */}
                <text
                  x="120"
                  y="70"
                  textAnchor="middle"
                  fill="#fde047"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  ירושלים
                </text>
              </g>
            </g>

            {/* Center Gimbal Hub */}
            <circle
              cx="120"
              cy="120"
              r="18"
              fill="#1c1917"
              stroke="rgba(251, 191, 36, 0.6)"
              strokeWidth="1.5"
            />
            <circle
              cx="120"
              cy="120"
              r="4"
              fill={isAlignedWithJerusalem ? '#10b981' : '#fbbf24'}
            />
          </svg>
        </div>

        {/* Interactive Heading Simulator / Sensor Controls */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label
              htmlFor="heading-dial-slider"
              className="text-[11px] text-stone-500 dark:text-stone-400"
            >
              {sensorStatus === 'active'
                ? 'Live Magnetometer Active (or adjust manually):'
                : 'Rotate Device Heading:'}
            </label>
            <button
              type="button"
              onClick={() => setDeviceHeading(Math.round(targetBearing))}
              className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap"
            >
              Lock onto Jerusalem ({targetBearing.toFixed(0)}°)
            </button>
          </div>

          <input
            id="heading-dial-slider"
            type="range"
            min={0}
            max={359}
            step={1}
            value={deviceHeading}
            onChange={(e) => setDeviceHeading(Number(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Footer Sensor & GPS Calibration Bar */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={requestSensorPermission}
          className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors whitespace-nowrap"
        >
          <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>
            {sensorStatus === 'active'
              ? 'Sensor Calibrated'
              : 'Enable Device Compass'}
          </span>
        </button>

        {onUpdateLocation && (
          <button
            type="button"
            onClick={handleRequestGps}
            disabled={gpsUpdating}
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap shrink-0"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{gpsUpdating ? 'Locating...' : 'Sync GPS Coordinates'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
