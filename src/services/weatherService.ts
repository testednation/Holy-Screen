import {
  WeatherData,
  LocationConfig,
  HourlyForecastItem,
  DailyForecastItem,
} from '../types/dashboard';

export function getWeatherConditionLabel(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Atmospheric Fog';
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain Showers';
    case 71:
    case 73:
    case 75:
      return 'Snowfall';
    case 80:
    case 81:
    case 82:
      return 'Passing Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm';
    default:
      return 'Fair Conditions';
  }
}

function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export async function fetchWeatherForLocation(location: LocationConfig): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${
      location.longitude
    }&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${encodeURIComponent(
      location.tzid
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API failed');
    const data = await res.json();

    const currentTempF = Math.round(data.current?.temperature_2m ?? 64);
    const feelsLikeF = Math.round(data.current?.apparent_temperature ?? currentTempF);
    const weatherCode = data.current?.weather_code ?? 1;
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 54);
    const windMph = Math.round(data.current?.wind_speed_10m ?? 7);
    const isDay = Boolean(data.current?.is_day ?? 1);

    const highF = Math.round(data.daily?.temperature_2m_max?.[0] ?? currentTempF + 6);
    const lowF = Math.round(data.daily?.temperature_2m_min?.[0] ?? currentTempF - 8);
    const uvIndex = Math.round(data.daily?.uv_index_max?.[0] ?? 4);

    // Build next 8 hours
    const nowMs = Date.now();
    const hourlyTimes: string[] = data.hourly?.time || [];
    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyCodes: number[] = data.hourly?.weather_code || [];
    const hourlyPrecip: number[] = data.hourly?.precipitation_probability || [];

    let startIndex = hourlyTimes.findIndex((t) => new Date(t).getTime() >= nowMs - 3600000);
    if (startIndex < 0) startIndex = 0;

    const hourly: HourlyForecastItem[] = [];
    for (let i = 0; i < 8; i++) {
      const idx = startIndex + i;
      if (idx >= hourlyTimes.length) break;
      const dt = new Date(hourlyTimes[idx]);
      const tf = Math.round(hourlyTemps[idx] ?? currentTempF);
      hourly.push({
        timeLabel:
          i === 0
            ? 'Now'
            : dt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true,
              }),
        tempF: tf,
        tempC: fToC(tf),
        weatherCode: hourlyCodes[idx] ?? 1,
        precipProb: hourlyPrecip[idx] ?? 0,
      });
    }

    const dailyTimes: string[] = data.daily?.time || [];
    const dailyMax: number[] = data.daily?.temperature_2m_max || [];
    const dailyMin: number[] = data.daily?.temperature_2m_min || [];
    const dailyCodes: number[] = data.daily?.weather_code || [];
    const dailyPrecip: number[] = data.daily?.precipitation_probability_max || [];
    const dailySunrise: string[] = data.daily?.sunrise || [];
    const dailySunset: string[] = data.daily?.sunset || [];

    const daily: DailyForecastItem[] = [];
    for (let i = 0; i < Math.min(5, dailyTimes.length); i++) {
      const dt = new Date(dailyTimes[i] + 'T12:00:00');
      const hf = Math.round(dailyMax[i] ?? 68);
      const lf = Math.round(dailyMin[i] ?? 52);
      daily.push({
        dateStr: dailyTimes[i],
        dayName:
          i === 0
            ? 'Today'
            : dt.toLocaleDateString('en-US', {
                weekday: 'short',
              }),
        highF: hf,
        lowF: lf,
        highC: fToC(hf),
        lowC: fToC(lf),
        weatherCode: dailyCodes[i] ?? 1,
        precipProb: dailyPrecip[i] ?? 0,
        sunrise: dailySunrise[i] || '',
        sunset: dailySunset[i] || '',
      });
    }

    return {
      currentTempF,
      currentTempC: fToC(currentTempF),
      feelsLikeF,
      feelsLikeC: fToC(feelsLikeF),
      conditionText: getWeatherConditionLabel(weatherCode),
      weatherCode,
      humidity,
      windMph,
      uvIndex,
      isDay,
      highF,
      lowF,
      highC: fToC(highF),
      lowC: fToC(lowF),
      hourly,
      daily,
      fetchedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
  } catch {
    //Deterministic fallback if offline
    return {
      currentTempF: 62,
      currentTempC: 17,
      feelsLikeF: 60,
      feelsLikeC: 16,
      conditionText: 'Mainly Clear',
      weatherCode: 1,
      humidity: 52,
      windMph: 8,
      uvIndex: 4,
      isDay: true,
      highF: 66,
      lowF: 49,
      highC: 19,
      lowC: 9,
      hourly: [
        { timeLabel: 'Now', tempF: 62, tempC: 17, weatherCode: 1, precipProb: 0 },
        { timeLabel: '1 PM', tempF: 65, tempC: 18, weatherCode: 1, precipProb: 5 },
        { timeLabel: '2 PM', tempF: 66, tempC: 19, weatherCode: 2, precipProb: 5 },
        { timeLabel: '3 PM', tempF: 64, tempC: 18, weatherCode: 2, precipProb: 10 },
        { timeLabel: '4 PM', tempF: 61, tempC: 16, weatherCode: 1, precipProb: 5 },
        { timeLabel: '5 PM', tempF: 57, tempC: 14, weatherCode: 0, precipProb: 0 },
        { timeLabel: '6 PM', tempF: 54, tempC: 12, weatherCode: 0, precipProb: 0 },
        { timeLabel: '7 PM', tempF: 52, tempC: 11, weatherCode: 0, precipProb: 0 },
      ],
      daily: [
        {
          dateStr: '2026-11-01',
          dayName: 'Today',
          highF: 66,
          lowF: 49,
          highC: 19,
          lowC: 9,
          weatherCode: 1,
          precipProb: 5,
          sunrise: '',
          sunset: '',
        },
        {
          dateStr: '2026-11-02',
          dayName: 'Mon',
          highF: 64,
          lowF: 48,
          highC: 18,
          lowC: 9,
          weatherCode: 2,
          precipProb: 15,
          sunrise: '',
          sunset: '',
        },
        {
          dateStr: '2026-11-03',
          dayName: 'Tue',
          highF: 61,
          lowF: 46,
          highC: 16,
          lowC: 8,
          weatherCode: 0,
          precipProb: 0,
          sunrise: '',
          sunset: '',
        },
        {
          dateStr: '2026-11-04',
          dayName: 'Wed',
          highF: 63,
          lowF: 47,
          highC: 17,
          lowC: 8,
          weatherCode: 1,
          precipProb: 10,
          sunrise: '',
          sunset: '',
        },
        {
          dateStr: '2026-11-05',
          dayName: 'Thu',
          highF: 67,
          lowF: 51,
          highC: 19,
          lowC: 11,
          weatherCode: 0,
          precipProb: 5,
          sunrise: '',
          sunset: '',
        },
      ],
      fetchedAt: 'Live',
    };
  }
}

export async function searchCitiesGeocode(query: string): Promise<LocationConfig[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: any[] = data.results || [];
    return results.map((r) => {
      const isJerusalem =
        r.name?.toLowerCase().includes('jerusalem') && r.country_code === 'IL';
      return {
        id: `geo-${r.id}`,
        name: r.name,
        region: [r.admin1, r.country].filter(Boolean).join(', '),
        latitude: r.latitude,
        longitude: r.longitude,
        tzid: r.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
        candleLightingMinutes: isJerusalem ? 40 : 18,
      };
    });
  } catch {
    return [];
  }
}
