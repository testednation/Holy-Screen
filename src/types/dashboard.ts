export type ShitaOpinion = 'GRA' | 'MGA' | 'BAAL_HATANYA';

export interface LocationConfig {
  id: string;
  name: string;
  hebrewName?: string;
  region: string;
  latitude: number;
  longitude: number;
  tzid: string;
  candleLightingMinutes: number;
}

export interface ZmanItem {
  id: string;
  titleEn: string;
  titleHe: string;
  category: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  time: Date;
  formattedTime: string;
  description: string;
  halachicNote: string;
  isPrimary?: boolean;
}

export interface ZmanimData {
  dateStr: string;
  hebrewDateEn: string;
  hebrewDateHe: string;
  shaahZmanitGraMinutes: number;
  shaahZmanitMgaMinutes: number;
  sunrise: Date;
  sunset: Date;
  items: ZmanItem[];
  source: 'hebcal' | 'astronomical';
}

export interface HourlyForecastItem {
  timeLabel: string;
  tempF: number;
  tempC: number;
  weatherCode: number;
  precipProb: number;
}

export interface DailyForecastItem {
  dateStr: string;
  dayName: string;
  highF: number;
  lowF: number;
  highC: number;
  lowC: number;
  weatherCode: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  currentTempF: number;
  currentTempC: number;
  feelsLikeF: number;
  feelsLikeC: number;
  conditionText: string;
  weatherCode: number;
  humidity: number;
  windMph: number;
  uvIndex: number;
  isDay: boolean;
  highF: number;
  lowF: number;
  highC: number;
  lowC: number;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  fetchedAt: string;
}

export interface AliyahItem {
  num: string;
  labelEn: string;
  labelHe: string;
  ref: string;
}

export interface ParshaData {
  nameEn: string;
  nameHe: string;
  fullRef: string;
  haftarahRef: string;
  candleLighting: string;
  havdalah: string;
  shabbatDateStr: string;
  specialShabbat?: string;
  summary: string;
  aliyot: AliyahItem[];
}

export interface LimudItem {
  id: string;
  titleEn: string;
  titleHe: string;
  displayValueEn: string;
  displayValueHe: string;
  ref: string;
  category: string;
}

export interface DafYomiData {
  masechetEn: string;
  masechetHe: string;
  sederEn: string;
  sederHe: string;
  dafNum: number;
  dafHe: string;
  masechetTotalDappim: number;
  masechetProgressDia: number;
  masechetProgressPct: number;
  daysUntilSiyumMasechet: number;
  cycleDayIndex: number;
  cycleTotalDays: number;
  cycleProgressPct: number;
  refAmudA: string;
  refAmudB: string;
}

export interface MizrachMetrics {
  greatCircleBearingDeg: number;
  greatCircleCardinal: string;
  rhumbLineBearingDeg: number;
  rhumbLineCardinal: string;
  distanceKm: number;
  distanceMiles: number;
  isNearTempleMount: boolean;
}

export type MinyanServiceType = 'Shacharis' | 'Mincha' | 'Maariv';

export interface MinyanScheduleItem {
  id: string;
  service: MinyanServiceType;
  time24: string; // "HH:MM"
  locationNote: string;
}

export interface SynagogueConfig {
  shulName: string;
  nusach: string;
  schedule: MinyanScheduleItem[];
}

export interface JewishHolidayEvent {
  id: string;
  nameEn: string;
  nameHe: string;
  category: 'major_yom_tov' | 'rabbinic_festival' | 'minor_holiday' | 'fast_day';
  categoryLabel: string;
  hebrewDateLabelEn: string;
  hebrewDateLabelHe: string;
  startDate: Date; // First full day of the holiday
  erevDate: Date;  // Evening before when the holiday begins at sunset
  erevSunsetFormatted: string;
  gregorianDateFormatted: string;
  erevDateFormatted: string;
  daysRemaining: number;
  isMajorFestival: boolean;
  durationLabel: string;
  mitzvotSummary: string;
  sefariaRef: string;
}

export interface HaYomYomEntry {
  id: string;
  hebrewDateDisplayHe: string;
  hebrewDateDisplayEn: string;
  hebrewDayNum: number;
  hebrewMonthEn: string;
  hebrewMonthHe: string;
  tehillimRangeEn: string;
  tehillimRangeHe: string;
  tehillimSefariaRef: string;
  tanyaPortionEn: string;
  tanyaPortionHe: string;
  tanyaSefariaRef: string;
  chassidicMilestone?: string;
  titleEn: string;
  titleHe: string;
  aphorismHe: string;
  aphorismEn: string;
  practicalAvodah: string;
  sourceNote: string;
}

export type BuiltinWidgetType =
  | 'zmanim'
  | 'mini_calendar'
  | 'upcoming_holidays'
  | 'hayom_yom'
  | 'daf_yomi'
  | 'daily_thought'
  | 'prayer_direction'
  | 'daily_minyan'
  | 'weather'
  | 'parsha'
  | 'limud'
  | 'shabbat_prep'
  | 'tzedakah'
  | 'notes'
  | 'world_clocks'
  | 'custom';

export interface HebrewCalendarCell {
  date: Date;
  ymd: string;
  hebrewDayNum: number;
  hebrewDayGematria: string;
  gregorianDayNum: number;
  gregorianMonthShort: string;
  isCurrentHebrewMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isShabbat: boolean;
  isRoshChodesh: boolean;
  specialLabel?: string;
}

export interface HebrewMonthGridData {
  hebrewMonthNameEn: string;
  hebrewMonthNameHe: string;
  hebrewYearEn: string;
  gregorianRangeLabel: string;
  firstDayOfHebrewMonth: Date;
  lastDayOfHebrewMonth: Date;
  cells: HebrewCalendarCell[];
}

export type WidgetSpan = 1 | 2 | 3;

export interface CustomWidgetPayload {
  subType: 'countdown' | 'checklist' | 'links';
  targetDate?: string;
  eventSubtitle?: string;
  items?: { id: string; text: string; done: boolean }[];
  links?: { id: string; label: string; url: string }[];
}

export interface WidgetInstance {
  id: string;
  type: BuiltinWidgetType;
  title: string;
  subtitle?: string;
  span: WidgetSpan;
  visible: boolean;
  customData?: CustomWidgetPayload;
}

export interface TzedakahEntry {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'donation';
  amount: number;
}

export interface RefuahEntry {
  id: string;
  nameHe: string;
  nameEn: string;
  note: string;
}
