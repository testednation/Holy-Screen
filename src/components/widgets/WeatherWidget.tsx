import React, { useState } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  CloudLightning,
} from 'lucide-react';
import { WeatherData, LocationConfig } from '../../types/dashboard';
import { getWeatherConditionLabel } from '../../services/weatherService';

interface WeatherWidgetProps {
  weather: WeatherData;
  location: LocationConfig;
}

export function renderWeatherIcon(code: number, className = 'w-5 h-5') {
  if (code === 0 || code === 1) {
    return <Sun className={`${className} text-amber-500`} />;
  }
  if (code === 2 || code === 3 || code === 45 || code === 48) {
    return <CloudSun className={`${className} text-stone-500 dark:text-stone-400`} />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-sky-600 dark:text-sky-400`} />;
  }
  if (code >= 71 && code <= 77) {
    return <CloudSnow className={`${className} text-indigo-400`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${className} text-amber-600`} />;
  }
  return <Cloud className={`${className} text-stone-400`} />;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, location }) => {
  const [unit, setUnit] = useState<'F' | 'C'>('F');

  const formatTemp = (f: number, c: number) => (unit === 'F' ? `${f}°` : `${c}°`);

  const skyAdvisory =
    weather.weatherCode <= 1
      ? 'Clear skies tonight — favorable visibility for Tzeit HaKochavim & Kiddush Levana.'
      : weather.weatherCode >= 51
      ? 'Precipitation expected — plan accordingly for walking to Mincha / Maariv.'
      : 'Partly cloudy canopy — pleasant conditions through Plag HaMincha.';

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Local Atmosphere</span>
              <span aria-hidden="true">·</span>
              <span>{location.name}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Weather & Sky · מזג האוויר
            </h2>
          </div>

          <div
            className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700"
            role="group"
            aria-label="Temperature Unit"
          >
            <button
              type="button"
              onClick={() => setUnit('F')}
              className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                unit === 'F'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              °F
            </button>
            <button
              type="button"
              onClick={() => setUnit('C')}
              className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                unit === 'C'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              °C
            </button>
          </div>
        </div>

        {/* Current Temperature & Primary Metrics */}
        <div className="py-4 flex items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-semibold font-mono tabular-nums tracking-tight text-stone-900 dark:text-stone-100">
                {formatTemp(weather.currentTempF, weather.currentTempC)}
              </span>
              <div>
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  {renderWeatherIcon(weather.weatherCode, 'w-4 h-4')}
                  <span>{weather.conditionText}</span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums mt-0.5">
                  H: {formatTemp(weather.highF, weather.highC)} · L:{' '}
                  {formatTemp(weather.lowF, weather.lowC)} · Feels{' '}
                  {formatTemp(weather.feelsLikeF, weather.feelsLikeC)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs text-stone-600 dark:text-stone-400 font-mono tabular-nums">
            <div className="flex items-center justify-end gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{weather.humidity}% RH</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Wind className="w-3.5 h-3.5 text-stone-400" />
              <span>{weather.windMph} mph</span>
            </div>
            <div className="col-span-2 text-[11px] text-stone-400 dark:text-stone-500">
              Peak UV Index: {weather.uvIndex}
            </div>
          </div>
        </div>

        {/* Hourly Strip */}
        <div className="py-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
            Hourly Progression
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {weather.hourly.slice(0, 8).map((hr, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center py-1.5 px-1 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-800"
              >
                <span className="text-[10px] text-stone-500 dark:text-stone-400 whitespace-nowrap">
                  {hr.timeLabel}
                </span>
                <div className="my-1.5">{renderWeatherIcon(hr.weatherCode, 'w-4 h-4')}</div>
                <span className="text-xs font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                  {formatTemp(hr.tempF, hr.tempC)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Day Forecast Table */}
        <div className="pt-3">
          <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1.5">
            5-Day Outlook
          </div>
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80">
            {weather.daily.map((day) => (
              <div
                key={day.dateStr}
                className="py-1.5 flex items-center justify-between text-xs"
              >
                <span className="w-14 font-medium text-stone-800 dark:text-stone-200">
                  {day.dayName}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  {renderWeatherIcon(day.weatherCode, 'w-3.5 h-3.5')}
                  <span className="text-stone-500 dark:text-stone-400 truncate">
                    {getWeatherConditionLabel(day.weatherCode)}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                  {day.precipProb > 10 && (
                    <span className="text-[11px] text-sky-600 dark:text-sky-400">
                      {day.precipProb}%
                    </span>
                  )}
                  <span className="text-stone-400 dark:text-stone-500 w-7 text-right">
                    {formatTemp(day.lowF, day.lowC)}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 w-7 text-right">
                    {formatTemp(day.highF, day.highC)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Advisory */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        {skyAdvisory}
      </div>
    </div>
  );
};
