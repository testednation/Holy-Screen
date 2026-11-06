import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  GripVertical,
  HelpCircle,
  MapPin,
  Mic,
  Moon,
  PieChart,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import {
  LocationConfig,
  ShitaOpinion,
  WidgetInstance,
  WidgetSpan,
  WeatherData,
  ZmanimData,
  ParshaData,
  LimudItem,
} from './types/dashboard';
import {
  PRESET_LOCATIONS,
  buildZmanimFromAstronomy,
  fetchZmanimForDate,
  fetchParshaAndLimud,
  getHebrewDateStrings,
  buildHebrewMonthGrid,
} from './services/halachaService';
import {
  fetchWeatherForLocation,
  searchCitiesGeocode,
} from './services/weatherService';
import { ZmanimWidget } from './components/widgets/ZmanimWidget';
import { MiniCalendarWidget } from './components/widgets/MiniCalendarWidget';
import { UpcomingHolidaysWidget } from './components/widgets/UpcomingHolidaysWidget';
import { HaYomYomWidget } from './components/widgets/HaYomYomWidget';
import { DailyTehillimWidget } from './components/widgets/DailyTehillimWidget';
import { DafYomiWidget } from './components/widgets/DafYomiWidget';
import { DailyThoughtWidget } from './components/widgets/DailyThoughtWidget';
import { PrayerDirectionWidget } from './components/widgets/PrayerDirectionWidget';
import { DailyMinyanWidget } from './components/widgets/DailyMinyanWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { ParshaWidget } from './components/widgets/ParshaWidget';
import { LimudWidget } from './components/widgets/LimudWidget';
import { ChayenuDailyWidget } from './components/widgets/ChayenuDailyWidget';
import { ShiurimTrackerWidget } from './components/widgets/ShiurimTrackerWidget';
import { RambamDailyWidget } from './components/widgets/RambamDailyWidget';
import { GeulahMoshiachWidget } from './components/widgets/GeulahMoshiachWidget';
import {
  ShabbatPrepWidget,
  TzedakahWidget,
  NotesWidget,
  WorldClocksWidget,
  CustomUserWidget,
} from './components/widgets/ExtraWidgets';
import { SefariaReaderModal } from './components/SefariaReaderModal';
import { WidgetGalleryModal } from './components/WidgetGalleryModal';
import { SettingsModal, OrahExportPackage } from './components/SettingsModal';
import { InfographicView } from './components/InfographicView';
import {
  PWAInstallButton,
  OfflineIndicator,
} from './components/PWAInstallControl';
import {
  LanguageProvider,
  useLanguage,
  LanguageSwitcher,
  localizeZmanimData,
  localizeWeatherData,
  localizeWidgetTitle,
} from './components/LanguageControl';
import { ZmanimProximityAlertControl } from './components/ZmanimProximityAlert';
import {
  OnboardingTutorialModal,
  TUTORIAL_STORAGE_KEY,
} from './components/OnboardingTutorialModal';

const DEFAULT_WIDGETS: WidgetInstance[] = [
  {
    id: 'w-zmanim',
    type: 'zmanim',
    title: 'Halachic Zmanim & Solar Horizon',
    span: 2,
    visible: true,
  },
  {
    id: 'w-mini-calendar',
    type: 'mini_calendar',
    title: 'Mini Calendar · Hebrew Month Luach',
    span: 1,
    visible: true,
  },
  {
    id: 'w-upcoming-holidays',
    type: 'upcoming_holidays',
    title: 'Upcoming Holidays · Festival Countdown',
    span: 1,
    visible: true,
  },
  {
    id: 'w-chayenu-daily',
    type: 'chayenu_daily',
    title: 'Chayenu: Daily Study Companion (chayenu.org)',
    span: 2,
    visible: true,
  },
  {
    id: 'w-shiurim-tracker',
    type: 'shiurim_tracker',
    title: 'Shiurim Tracker · מעקב שיעורים יומי',
    span: 1,
    visible: true,
  },
  {
    id: 'w-rambam-daily',
    type: 'rambam_daily',
    title: 'Rambam Daily Study · Mishneh Torah & Sefer HaMitzvot',
    span: 1,
    visible: true,
  },
  {
    id: 'w-geulah-moshiach',
    type: 'geulah_moshiach',
    title: 'Geulah & Moshiach · ענייני גאולה ומשיח',
    span: 1,
    visible: true,
  },
  {
    id: 'w-hayom-yom',
    type: 'hayom_yom',
    title: 'HaYom Yom · לוח היום יום',
    span: 1,
    visible: true,
  },
  {
    id: 'w-daily-tehillim',
    type: 'daily_tehillim',
    title: 'Daily Tehillim · תהילים יומי',
    span: 1,
    visible: true,
  },
  {
    id: 'w-daf-yomi',
    type: 'daf_yomi',
    title: 'Daf Yomi & Masechet Tracker',
    span: 1,
    visible: true,
  },
  {
    id: 'w-daily-thought',
    type: 'daily_thought',
    title: 'Daily Thought · Mishnah & Parsha Gem',
    span: 1,
    visible: true,
  },
  {
    id: 'w-prayer-direction',
    type: 'prayer_direction',
    title: 'Direction of Prayer · Mizrach Compass',
    span: 1,
    visible: true,
  },
  {
    id: 'w-daily-minyan',
    type: 'daily_minyan',
    title: 'Daily Minyan · Synagogue Schedule',
    span: 1,
    visible: true,
  },
  {
    id: 'w-weather',
    type: 'weather',
    title: 'Local Weather & Sky Advisory',
    span: 1,
    visible: true,
  },
  {
    id: 'w-parsha',
    type: 'parsha',
    title: 'Weekly Parsha & Shnayim Mikra',
    span: 1,
    visible: true,
  },
  {
    id: 'w-limud',
    type: 'limud',
    title: 'Daily Limud & Shiurim Schedule',
    span: 1,
    visible: true,
  },
  {
    id: 'w-shabbat-prep',
    type: 'shabbat_prep',
    title: 'Erev Shabbat Preparation Checklist',
    span: 1,
    visible: true,
  },
  {
    id: 'w-tzedakah',
    type: 'tzedakah',
    title: 'Maaser & Tzedakah Ledger',
    span: 1,
    visible: true,
  },
  {
    id: 'w-notes',
    type: 'notes',
    title: 'Kavanot & Tefillah Names',
    span: 1,
    visible: true,
  },
  {
    id: 'w-world-clocks',
    type: 'world_clocks',
    title: 'World Halachic Clocks',
    span: 1,
    visible: true,
  },
];

type NavViewFilter = 'all' | 'infographic' | 'zmanim' | 'torah' | 'shabbat';

export default function App() {
  return (
    <LanguageProvider>
      <OrahWorkspace />
    </LanguageProvider>
  );
}

function OrahWorkspace() {
  const prefersReducedMotion = useReducedMotion();
  const { lang, setLang, t, locale } = useLanguage();

  // Theme state synced with <html class="dark">
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('orah_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('orah_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Active Location
  const [location, setLocation] = useState<LocationConfig>(() => {
    try {
      const saved = localStorage.getItem('orah_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRESET_LOCATIONS[0]; // Brooklyn (Crown Heights) default
  });

  useEffect(() => {
    try {
      localStorage.setItem('orah_location', JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  // Shita Opinion
  const [shita, setShita] = useState<ShitaOpinion>(() => {
    try {
      const saved = localStorage.getItem('orah_shita') as ShitaOpinion;
      if (saved === 'GRA' || saved === 'MGA' || saved === 'BAAL_HATANYA') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'GRA';
  });

  const handleSelectShita = (next: ShitaOpinion) => {
    setShita(next);
    try {
      localStorage.setItem('orah_shita', next);
    } catch {
      // ignore
    }
  };

  // Selected Date for Zmanim
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Instant initial synchronous Zmanim calculation + live Hebcal enhancement
  const [zmanim, setZmanim] = useState<ZmanimData>(() =>
    buildZmanimFromAstronomy(new Date(), location, shita)
  );

  // Weather Data
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Parsha & Limud Data
  const [parsha, setParsha] = useState<ParshaData | null>(null);
  const [limud, setLimud] = useState<LimudItem[]>([]);

  // Navigation filter & customization states
  const [navView, setNavView] = useState<NavViewFilter>('all');
  const [isCustomizingLayout, setIsCustomizingLayout] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TUTORIAL_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const [dragHandleArmedId, setDragHandleArmedId] = useState<string | null>(null);
  const [recentlyMovedWidgetId, setRecentlyMovedWidgetId] = useState<string | null>(null);
  const lastReorderTimeRef = useRef<number>(0);

  // Location & Date Picker Popovers
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [datePickerMonthAnchor, setDatePickerMonthAnchor] = useState<Date>(
    () => new Date()
  );
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [citySearchResults, setCitySearchResults] = useState<LocationConfig[]>([]);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  // Sefaria Reader Modal
  const [readerRef, setReaderRef] = useState<{
    ref: string | null;
    title: string;
    autoStartVoice?: boolean;
  }>({
    ref: null,
    title: '',
    autoStartVoice: false,
  });

  // Widgets Configuration
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    try {
      const saved = localStorage.getItem('orah_widgets_v1');
      if (saved) {
        const parsed: WidgetInstance[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let nextList = [...parsed];
          if (!nextList.some((w) => w.type === 'mini_calendar')) {
            const miniCalDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'mini_calendar'
            )!;
            const zmanimIdx = nextList.findIndex((w) => w.type === 'zmanim');
            nextList.splice(zmanimIdx >= 0 ? zmanimIdx + 1 : 1, 0, miniCalDefault);
          }
          if (!nextList.some((w) => w.type === 'daf_yomi')) {
            const dafDefault = DEFAULT_WIDGETS.find((w) => w.type === 'daf_yomi')!;
            const calIdx = nextList.findIndex((w) => w.type === 'mini_calendar');
            nextList.splice(calIdx >= 0 ? calIdx + 1 : 2, 0, dafDefault);
          }
          if (!nextList.some((w) => w.type === 'daily_thought')) {
            const thoughtDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'daily_thought'
            )!;
            const dafIdx = nextList.findIndex((w) => w.type === 'daf_yomi');
            nextList.splice(dafIdx >= 0 ? dafIdx + 1 : 3, 0, thoughtDefault);
          }
          if (!nextList.some((w) => w.type === 'prayer_direction')) {
            const compassDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'prayer_direction'
            )!;
            const thoughtIdx = nextList.findIndex(
              (w) => w.type === 'daily_thought'
            );
            nextList.splice(
              thoughtIdx >= 0 ? thoughtIdx + 1 : 4,
              0,
              compassDefault
            );
          }
          if (!nextList.some((w) => w.type === 'daily_minyan')) {
            const minyanDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'daily_minyan'
            )!;
            const compassIdx = nextList.findIndex(
              (w) => w.type === 'prayer_direction'
            );
            nextList.splice(
              compassIdx >= 0 ? compassIdx + 1 : 5,
              0,
              minyanDefault
            );
          }
          if (!nextList.some((w) => w.type === 'upcoming_holidays')) {
            const holidaysDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'upcoming_holidays'
            )!;
            const calIdx = nextList.findIndex((w) => w.type === 'mini_calendar');
            nextList.splice(
              calIdx >= 0 ? calIdx + 1 : 2,
              0,
              holidaysDefault
            );
          }
          if (!nextList.some((w) => w.type === 'hayom_yom')) {
            const hayomYomDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'hayom_yom'
            )!;
            const holIdx = nextList.findIndex(
              (w) => w.type === 'upcoming_holidays'
            );
            nextList.splice(
              holIdx >= 0 ? holIdx + 1 : 3,
              0,
              hayomYomDefault
            );
          }
          if (!nextList.some((w) => w.type === 'daily_tehillim')) {
            const tehillimDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'daily_tehillim'
            )!;
            const hyyIdx = nextList.findIndex((w) => w.type === 'hayom_yom');
            nextList.splice(
              hyyIdx >= 0 ? hyyIdx + 1 : 4,
              0,
              tehillimDefault
            );
          }
          if (!nextList.some((w) => w.type === 'chayenu_daily')) {
            const chayenuDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'chayenu_daily'
            )!;
            const holIdx = nextList.findIndex(
              (w) => w.type === 'upcoming_holidays'
            );
            nextList.splice(
              holIdx >= 0 ? holIdx + 1 : 3,
              0,
              chayenuDefault
            );
          }
          if (!nextList.some((w) => w.type === 'rambam_daily')) {
            const rambamDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'rambam_daily'
            )!;
            const chIdx = nextList.findIndex((w) => w.type === 'chayenu_daily');
            nextList.splice(
              chIdx >= 0 ? chIdx + 1 : 4,
              0,
              rambamDefault
            );
          }
          if (!nextList.some((w) => w.type === 'geulah_moshiach')) {
            const geulahDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'geulah_moshiach'
            )!;
            const rmIdx = nextList.findIndex((w) => w.type === 'rambam_daily');
            nextList.splice(
              rmIdx >= 0 ? rmIdx + 1 : 5,
              0,
              geulahDefault
            );
          }
          if (!nextList.some((w) => w.type === 'shiurim_tracker')) {
            const shiurimDefault = DEFAULT_WIDGETS.find(
              (w) => w.type === 'shiurim_tracker'
            )!;
            const chIdx = nextList.findIndex((w) => w.type === 'chayenu_daily');
            nextList.splice(
              chIdx >= 0 ? chIdx + 1 : 5,
              0,
              shiurimDefault
            );
          }
          return nextList;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('orah_widgets_v1', JSON.stringify(widgets));
    } catch {
      // ignore
    }
  }, [widgets]);

  // Fetch Zmanim whenever date, location, or shita changes
  useEffect(() => {
    let active = true;
    // Immediately update with deterministic astronomical calculation so zero lag
    setZmanim(buildZmanimFromAstronomy(selectedDate, location, shita));

    fetchZmanimForDate(selectedDate, location, shita).then((liveZmanim) => {
      if (active) setZmanim(liveZmanim);
    });

    return () => {
      active = false;
    };
  }, [selectedDate, location, shita]);

  // Fetch Weather and Parsha/Limud when location changes
  useEffect(() => {
    let active = true;
    fetchWeatherForLocation(location).then((w) => {
      if (active) setWeather(w);
    });
    fetchParshaAndLimud(selectedDate, location).then(({ parsha: p, limud: l }) => {
      if (active) {
        setParsha(p);
        setLimud(l);
      }
    });
    return () => {
      active = false;
    };
  }, [location, selectedDate]);

  // City Geocoding Search
  useEffect(() => {
    if (citySearchQuery.trim().length < 2) {
      setCitySearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchCitiesGeocode(citySearchQuery).then(setCitySearchResults);
    }, 280);
    return () => clearTimeout(timer);
  }, [citySearchQuery]);

  // Browser GPS Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz =
          Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
        setLocation({
          id: 'gps-current',
          name: 'Current GPS Horizon',
          hebrewName: 'מיקום נוכחי',
          region: `${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(
            2
          )}°E`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          tzid: tz,
          candleLightingMinutes: tz === 'Asia/Jerusalem' ? 40 : 18,
        });
        setGeoLocating(false);
        setIsLocationPickerOpen(false);
      },
      () => {
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Widget Layout Handlers
  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const changeWidgetSpan = (id: string, span: WidgetSpan) => {
    setRecentlyMovedWidgetId(id);
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, span } : w)));
  };

  const reorderWidgets = (draggedId: string, targetId: string) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    setRecentlyMovedWidgetId(draggedId);
    setWidgets((prev) => {
      const fromIndex = prev.findIndex((w) => w.id === draggedId);
      const toIndex = prev.findIndex((w) => w.id === targetId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const moveWidgetByStep = (
    widgetId: string,
    direction: -1 | 1,
    visibleList: WidgetInstance[]
  ) => {
    const currentIdxInVisible = visibleList.findIndex((w) => w.id === widgetId);
    if (currentIdxInVisible < 0) return;
    const neighbor = visibleList[currentIdxInVisible + direction];
    if (!neighbor) return;
    reorderWidgets(widgetId, neighbor.id);
  };

  useEffect(() => {
    if (!recentlyMovedWidgetId) return;
    const timer = window.setTimeout(() => {
      setRecentlyMovedWidgetId(null);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [recentlyMovedWidgetId]);

  const addCustomWidget = (newWidget: WidgetInstance) => {
    setWidgets((prev) => [...prev, newWidget]);
  };

  const deleteCustomWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWidgetInstance = (updated: WidgetInstance) => {
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleApplyImport = (importedPackage: OrahExportPackage) => {
    if (
      Array.isArray(importedPackage.widgets) &&
      importedPackage.widgets.length > 0
    ) {
      setWidgets(importedPackage.widgets);
      try {
        localStorage.setItem(
          'orah_widgets_v1',
          JSON.stringify(importedPackage.widgets)
        );
      } catch {
        // ignore
      }
    }
    if (importedPackage.preferences) {
      const pref = importedPackage.preferences;
      if (pref.location) {
        setLocation(pref.location);
        try {
          localStorage.setItem('orah_location', JSON.stringify(pref.location));
        } catch {
          // ignore
        }
      }
      if (pref.shita) {
        setShita(pref.shita);
        try {
          localStorage.setItem('orah_shita', pref.shita);
        } catch {
          // ignore
        }
      }
      if (pref.theme) {
        setDarkMode(pref.theme === 'dark');
        try {
          localStorage.setItem('orah_theme', pref.theme);
        } catch {
          // ignore
        }
      }
      if (pref.language) {
        setLang(pref.language);
        try {
          localStorage.setItem('orah_lang', pref.language);
        } catch {
          // ignore
        }
      }
      if (pref.proximityAlerts) {
        try {
          localStorage.setItem(
            'orah_proximity_alerts_v1',
            JSON.stringify(pref.proximityAlerts)
          );
        } catch {
          // ignore
        }
      }
      if (pref.kavanotText) {
        try {
          localStorage.setItem('orah_kavanot_text', pref.kavanotText);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleResetDefaults = () => {
    setWidgets(DEFAULT_WIDGETS);
    try {
      localStorage.setItem('orah_widgets_v1', JSON.stringify(DEFAULT_WIDGETS));
    } catch {
      // ignore
    }
  };

  const applyPreset = (preset: 'complete' | 'focused' | 'shabbat') => {
    if (preset === 'complete') {
      setWidgets((prev) => prev.map((w) => ({ ...w, visible: true })));
    } else if (preset === 'focused') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          visible: [
            'zmanim',
            'mini_calendar',
            'upcoming_holidays',
            'chayenu_daily',
            'shiurim_tracker',
            'rambam_daily',
            'geulah_moshiach',
            'hayom_yom',
            'daily_tehillim',
            'daf_yomi',
            'daily_thought',
            'prayer_direction',
            'daily_minyan',
            'parsha',
            'limud',
            'weather',
            'notes',
          ].includes(w.type),
        }))
      );
    } else if (preset === 'shabbat') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          visible: [
            'zmanim',
            'mini_calendar',
            'upcoming_holidays',
            'chayenu_daily',
            'geulah_moshiach',
            'hayom_yom',
            'daily_tehillim',
            'daily_thought',
            'prayer_direction',
            'daily_minyan',
            'parsha',
            'shabbat_prep',
            'weather',
            'tzedakah',
            'notes',
          ].includes(w.type),
        }))
      );
    }
  };

  // Filtered widgets based on top navigation selection
  const displayedWidgets = useMemo(() => {
    const active = widgets.filter((w) => w.visible);
    if (navView === 'all') return active;
    if (navView === 'zmanim') {
      return active.filter((w) =>
        [
          'zmanim',
          'mini_calendar',
          'upcoming_holidays',
          'prayer_direction',
          'daily_minyan',
          'weather',
          'world_clocks',
        ].includes(w.type)
      );
    }
    if (navView === 'torah') {
      return active.filter((w) =>
        [
          'mini_calendar',
          'upcoming_holidays',
          'chayenu_daily',
          'shiurim_tracker',
          'rambam_daily',
          'geulah_moshiach',
          'hayom_yom',
          'daily_tehillim',
          'daf_yomi',
          'daily_thought',
          'parsha',
          'limud',
          'notes',
        ].includes(w.type)
      );
    }
    if (navView === 'shabbat') {
      return active.filter((w) =>
        [
          'mini_calendar',
          'upcoming_holidays',
          'chayenu_daily',
          'geulah_moshiach',
          'hayom_yom',
          'daily_tehillim',
          'daily_thought',
          'parsha',
          'shabbat_prep',
          'tzedakah',
          'custom',
        ].includes(w.type)
      );
    }
    return active;
  }, [widgets, navView]);

  const todayHebrew = useMemo(() => getHebrewDateStrings(selectedDate), [selectedDate]);
  const isSelectedToday = useMemo(
    () => selectedDate.toDateString() === new Date().toDateString(),
    [selectedDate]
  );
  const selectedDateInputValue = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const headerPickerMonthGrid = useMemo(
    () => buildHebrewMonthGrid(datePickerMonthAnchor, selectedDate),
    [datePickerMonthAnchor, selectedDate]
  );

  const shiftSelectedDateByDays = (deltaDays: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + deltaDays);
      setDatePickerMonthAnchor(next);
      return next;
    });
  };

  const jumpToSpecificDate = (target: Date) => {
    const normalized = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
      12,
      0,
      0
    );
    setSelectedDate(normalized);
    setDatePickerMonthAnchor(normalized);
  };

  const jumpToUpcomingDayOfWeek = (dayOfWeek: number) => {
    const base = new Date();
    const diff = (dayOfWeek - base.getDay() + 7) % 7 || 7;
    const target = new Date(base);
    target.setDate(base.getDate() + diff);
    jumpToSpecificDate(target);
  };

  const jumpToNextRoshChodesh = () => {
    const currentGrid = buildHebrewMonthGrid(selectedDate, selectedDate);
    const nextMonthStart = new Date(
      currentGrid.lastDayOfHebrewMonth.getTime() + 86400000
    );
    jumpToSpecificDate(nextMonthStart);
  };

  const localizedZmanim = useMemo(
    () => localizeZmanimData(zmanim, lang),
    [zmanim, lang]
  );
  const localizedWeather = useMemo(
    () => localizeWeatherData(weather, lang),
    [weather, lang]
  );

  const sunriseItem = localizedZmanim.items.find((i) => i.id === 'sunrise');
  const sunsetItem = localizedZmanim.items.find((i) => i.id === 'sunset');
  const shemaItem = localizedZmanim.items.find(
    (i) => i.id === (shita === 'MGA' ? 'shema_mga' : 'shema_gra')
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D12] text-stone-900 dark:text-stone-100 transition-colors">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0C0D12]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single Text Element Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setNavView('all');
            }}
            className="text-xl font-bold tracking-tight font-display text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0"
          >
            Orah · אורה
          </a>

          {/* Zone 2: 4 Single-Line Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-400"
            aria-label="Primary Workspace Views"
          >
            {(
              [
                { id: 'all', label: t.navHomescreen },
                { id: 'infographic', label: t.navInfographic },
                { id: 'zmanim', label: t.navZmanimSky },
                { id: 'torah', label: t.navParshaLimud },
              ] as { id: NavViewFilter; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNavView(item.id)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  navView === item.id
                    ? 'border-amber-700 dark:border-amber-400 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-transparent hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 dark:bg-amber-600 dark:text-stone-950 rounded-lg hover:bg-stone-800 dark:hover:bg-amber-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.customizeWidgets}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTAINER */}
      <main id="top" className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Workspace Horizon Context Bar & Secondary Controls */}
        <section className="pb-6 mb-6 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              {/* Quiet Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-amber-800 dark:text-amber-400">
                  {todayHebrew.he}
                </span>
                <span aria-hidden="true">·</span>
                <span>{todayHebrew.en}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedDate.toLocaleDateString(locale, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {parsha && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {parsha.nameEn} ({parsha.nameHe})
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-1 text-balance">
                {t.heroSubtitle}
              </h1>
            </div>

            {/* Workspace Utility Controls: Date Picker, Location Selector, Zmanim Proximity Alerts, Language Switcher, Layout Edit Toggle, Theme Switch */}
            <div className="flex flex-wrap items-center gap-2.5 relative">
              {/* Header Date Picker & Time-Travel Control */}
              <div className="inline-flex items-center rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 p-0.5">
                <button
                  type="button"
                  onClick={() => shiftSelectedDateByDays(-1)}
                  title={t.previousDay}
                  aria-label={t.previousDay}
                  className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDatePickerMonthAnchor(selectedDate);
                    setIsDatePickerOpen((v) => !v);
                    setIsLocationPickerOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    !isSelectedToday || isDatePickerOpen
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                      : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="font-mono tabular-nums">
                    {isSelectedToday
                      ? `${t.today} · ${selectedDate.toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : selectedDate.toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                  </span>
                  <span className="text-stone-400 dark:text-stone-500">·</span>
                  <span className="text-amber-800 dark:text-amber-400 font-semibold">
                    {todayHebrew.he.replace(/\s*תשפ״[א-ת]$/, '')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => shiftSelectedDateByDays(1)}
                  title={t.nextDay}
                  aria-label={t.nextDay}
                  className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!isSelectedToday && (
                  <button
                    type="button"
                    onClick={() => jumpToSpecificDate(new Date())}
                    title={t.returnToToday}
                    className="ml-0.5 px-2 py-1 text-[11px] font-medium rounded-md bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 hover:bg-amber-800 dark:hover:bg-amber-400 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.today}</span>
                  </button>
                )}
              </div>

              {/* Location Picker Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsLocationPickerOpen((v) => !v);
                  setIsDatePickerOpen(false);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-600/60 transition-colors whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>{location.name}</span>
                <span className="text-stone-400 font-mono tabular-nums">
                  ({location.tzid.split('/').pop()?.replace('_', ' ')})
                </span>
              </button>

              {/* Zmanim Proximity Alert System (15m Before Plag HaMincha, Shkiah, etc.) */}
              <ZmanimProximityAlertControl
                zmanim={localizedZmanim}
                isSelectedToday={isSelectedToday}
                lang={lang}
              />

              {/* Multi-Language Switcher (English, Français, Español, Русский) */}
              <LanguageSwitcher />

              {/* Sefaria Voice Search Launcher */}
              <button
                type="button"
                onClick={() =>
                  setReaderRef({
                    ref: parsha?.fullRef || 'Berakhot 2a',
                    title: parsha
                      ? `${parsha.nameEn} · ${parsha.nameHe}`
                      : 'Berakhot 2a · מסכת ברכות',
                    autoStartVoice: true,
                  })
                }
                title="Open Sefaria Reader with Voice-Controlled Search"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-600/60 transition-colors whitespace-nowrap shrink-0"
              >
                <Mic className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Sefaria Voice Search</span>
              </button>

              {/* Infographic View Toggle Button */}
              <button
                type="button"
                onClick={() =>
                  setNavView((prev) =>
                    prev === 'infographic' ? 'all' : 'infographic'
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  navView === 'infographic'
                    ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500 font-semibold'
                    : 'bg-white dark:bg-[#14161F] border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-600/60'
                }`}
              >
                <PieChart className="w-3.5 h-3.5 text-amber-600 dark:text-current" />
                <span>
                  {navView === 'infographic'
                    ? t.exitInfographic
                    : t.navInfographic}
                </span>
              </button>

              {/* Inline Layout Rearrange Mode Toggle */}
              {navView !== 'infographic' && (
                <button
                  type="button"
                  onClick={() => setIsCustomizingLayout((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    isCustomizingLayout
                      ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500'
                      : 'bg-white dark:bg-[#14161F] border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {isCustomizingLayout ? t.finishEditingGrid : t.editGridLayout}
                </button>
              )}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 transition-colors whitespace-nowrap shrink-0"
                aria-label="Toggle Light or Dark Sanctuary Mode"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.daylight}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t.nightfall}</span>
                  </>
                )}
              </button>

              {/* Settings & Export/Import Configuration */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Workspace Settings & Export/Import Configuration"
                aria-label="Workspace Settings & Export/Import Configuration"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-600/60 transition-colors whitespace-nowrap shrink-0"
              >
                <Settings className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Settings</span>
              </button>

              {/* Welcome Guide / Interactive Tutorial Launcher */}
              <button
                type="button"
                onClick={() => setIsTutorialOpen(true)}
                title="Open Interactive Welcome Tutorial"
                aria-label="Open Interactive Welcome Tutorial"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-600/60 transition-colors whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Guide</span>
              </button>

              {/* Download / Install Offline App Control */}
              <PWAInstallButton
                location={location}
                zmanim={localizedZmanim}
                selectedDate={selectedDate}
                parsha={parsha}
              />

              {/* Date Picker & Retrospective/Future Planning Popover */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                        Jump to Date · Retrospective & Future Luach
                      </span>
                      <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                        {todayHebrew.he} · {todayHebrew.en}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1"
                      aria-label="Close date picker"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Direct Native Date Input for Any Past or Future Year */}
                  <div className="mb-3">
                    <label
                      htmlFor="header-date-jump-input"
                      className="block text-[10px] font-medium text-stone-500 dark:text-stone-400 mb-1"
                    >
                      Select or Type Any Gregorian Date
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="header-date-jump-input"
                        type="date"
                        value={selectedDateInputValue}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          if (y && m && d) {
                            jumpToSpecificDate(new Date(y, m - 1, d, 12, 0, 0));
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          jumpToSpecificDate(new Date());
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/70 hover:bg-amber-100/70 transition-colors whitespace-nowrap"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Quick Retrospective & Future Planning Shortcuts */}
                  <div className="mb-3 pb-3 border-b border-stone-200/80 dark:border-stone-800">
                    <div className="text-[10px] font-medium text-stone-400 mb-1.5">
                      Quick Horizon & Planning Jumps
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          jumpToUpcomingDayOfWeek(5);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors"
                      >
                        Upcoming Erev Shabbat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          jumpToUpcomingDayOfWeek(6);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors"
                      >
                        Upcoming Shabbat Kodesh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          jumpToNextRoshChodesh();
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors"
                      >
                        Next Rosh Chodesh (א׳)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          shiftSelectedDateByDays(7);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors font-mono tabular-nums"
                      >
                        +7 Days (Next Week)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          shiftSelectedDateByDays(-7);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors font-mono tabular-nums"
                      >
                        -7 Days (1 Week Ago)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          shiftSelectedDateByDays(30);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-stone-50 dark:bg-stone-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors font-mono tabular-nums"
                      >
                        +30 Days (Next Month)
                      </button>
                    </div>
                  </div>

                  {/* Interactive Bilingual Hebrew/Gregorian Month Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {headerPickerMonthGrid.hebrewMonthNameEn}{' '}
                        {headerPickerMonthGrid.hebrewYearEn} ·{' '}
                        <span className="text-amber-700 dark:text-amber-400">
                          {headerPickerMonthGrid.hebrewMonthNameHe}
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setDatePickerMonthAnchor(
                              new Date(
                                headerPickerMonthGrid.firstDayOfHebrewMonth.getTime() -
                                  2 * 86400000
                              )
                            )
                          }
                          className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                          title="Previous Hebrew Month"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDatePickerMonthAnchor(
                              new Date(
                                headerPickerMonthGrid.lastDayOfHebrewMonth.getTime() +
                                  2 * 86400000
                              )
                            )
                          }
                          className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                          title="Next Hebrew Month"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-400 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sh'].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {headerPickerMonthGrid.cells.map((cell) => (
                        <button
                          key={cell.ymd}
                          type="button"
                          onClick={() => {
                            jumpToSpecificDate(cell.date);
                            setIsDatePickerOpen(false);
                          }}
                          className={`p-1 rounded-md flex flex-col items-center justify-center transition-colors border ${
                            cell.isSelected
                              ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500 font-semibold'
                              : cell.isToday
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              : cell.isCurrentHebrewMonth
                              ? 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                              : 'border-transparent opacity-35 hover:opacity-75 text-stone-500'
                          }`}
                        >
                          <span className="text-[10px] leading-tight">
                            {cell.hebrewDayGematria}
                          </span>
                          <span className="text-[9px] font-mono tabular-nums opacity-75 leading-tight">
                            {cell.gregorianDayNum}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Location Dropdown Popover */}
              {isLocationPickerOpen && (
                <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      Select Halachic Horizon & Coordinates
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(false)}
                      className="text-stone-400 hover:text-stone-700 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search any city worldwide */}
                  <div className="relative mb-2.5">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="Search any city worldwide..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  {/* GPS Button */}
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={geoLocating}
                    className="w-full mb-3 py-1.5 px-3 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/70 flex items-center justify-center gap-1.5 hover:bg-amber-100/70 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    {geoLocating
                      ? 'Detecting GPS Coordinates...'
                      : 'Use Browser GPS Coordinates'}
                  </button>

                  {citySearchResults.length > 0 && (
                    <div className="mb-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                      <div className="text-[10px] font-medium text-stone-400 mb-1">
                        Search Results
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {citySearchResults.map((resLoc) => (
                          <button
                            key={resLoc.id}
                            type="button"
                            onClick={() => {
                              setLocation(resLoc);
                              setIsLocationPickerOpen(false);
                              setCitySearchQuery('');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
                          >
                            <span className="font-medium text-stone-900 dark:text-stone-100 truncate">
                              {resLoc.name}, {resLoc.region}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400 shrink-0 ml-2">
                              {resLoc.latitude.toFixed(1)}°, {resLoc.longitude.toFixed(1)}°
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] font-medium text-stone-400 mb-1.5">
                    Curated Communities
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto">
                    {PRESET_LOCATIONS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLocation(preset);
                          setIsLocationPickerOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          location.id === preset.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span>
                          {preset.name}{' '}
                          {preset.hebrewName ? `· ${preset.hebrewName}` : ''}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">
                          {preset.candleLightingMinutes}m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4-Column Quick Daily Horizon Summary Strip */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#14161F] border border-stone-200/80 dark:border-stone-800">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t.sunriseNetz}
              </div>
              <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {sunriseItem?.formattedTime || '—'}
              </div>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                {t.latestShema}: {shemaItem?.formattedTime}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#14161F] border border-stone-200/80 dark:border-stone-800">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t.sunsetShkiah}
              </div>
              <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {sunsetItem?.formattedTime || '—'}
              </div>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                {t.shaahZmanit}: {localizedZmanim.shaahZmanitGraMinutes} min
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#14161F] border border-stone-200/80 dark:border-stone-800">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t.shabbatCandles} · {parsha?.nameEn.replace('Parashat ', '') || ''}
              </div>
              <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {parsha?.candleLighting || '—'}
              </div>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                {t.havdalah}: {parsha?.havdalah || '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#14161F] border border-stone-200/80 dark:border-stone-800">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t.atmosphericConditions}
              </div>
              <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {localizedWeather
                  ? `${localizedWeather.currentTempF}°F · ${localizedWeather.conditionText}`
                  : t.loading}
              </div>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-mono tabular-nums">
                {localizedWeather
                  ? `${t.high} ${localizedWeather.highF}°F · ${t.low} ${localizedWeather.lowF}°F`
                  : location.name}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile View Filter Bar */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-4">
          {(
            [
              { id: 'all', label: t.allWidgets },
              { id: 'infographic', label: t.navInfographic },
              { id: 'zmanim', label: t.navZmanimSky },
              { id: 'torah', label: t.navParshaLimud },
              { id: 'shabbat', label: t.shabbatChesed },
            ] as { id: NavViewFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setNavView(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
                navView === tab.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-white dark:bg-[#14161F] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DEDICATED INFOGRAPHIC BROADSHEET VIEW OR MODULAR BENTO WIDGET GRID */}
        {navView === 'infographic' ? (
          <motion.div
            key="infographic-view"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <InfographicView
              zmanim={localizedZmanim}
              selectedDate={selectedDate}
              onChangeDate={jumpToSpecificDate}
              shita={shita}
              onChangeShita={handleSelectShita}
              location={location}
              parsha={parsha}
              limud={limud}
              weather={localizedWeather}
              onOpenReader={(ref, title) => setReaderRef({ ref, title })}
              onSwitchToBento={() => setNavView('all')}
            />
          </motion.div>
        ) : (
        <LayoutGroup id="orah-dashboard-bento-grid">
          {displayedWidgets.length === 0 ? (
            <motion.div
              layout
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="py-16 text-center rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200 dark:border-stone-800 p-8"
            >
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                No Widgets Active in This View
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                Open the Widget Gallery to enable Zmanim, Weather, Parsha, Daily Limud, or create your own custom homescreen widget.
              </p>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Open Widget Gallery
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      layout: {
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                        mass: 0.85,
                      },
                    }
              }
              className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
            >
              <AnimatePresence mode="popLayout">
                {displayedWidgets.map((widget, widgetIndex) => {
                  const colSpanClass =
                    widget.span === 3
                      ? 'lg:col-span-3'
                      : widget.span === 2
                      ? 'lg:col-span-2'
                      : 'lg:col-span-1';

                  const isBeingDragged = draggedWidgetId === widget.id;
                  const isDragTarget =
                    dragOverWidgetId === widget.id &&
                    draggedWidgetId !== null &&
                    draggedWidgetId !== widget.id;
                  const isRecentlyMoved = recentlyMovedWidgetId === widget.id;
                  const canMovePrev = widgetIndex > 0;
                  const canMoveNext = widgetIndex < displayedWidgets.length - 1;

                  return (
                    <motion.section
                      key={widget.id}
                      layout
                      layoutId={`dashboard-widget-${widget.id}`}
                      draggable={
                        isCustomizingLayout || dragHandleArmedId === widget.id
                      }
                      onDragStart={(e) => {
                        const targetEl = e.target as HTMLElement | null;
                        if (
                          targetEl &&
                          targetEl.closest('input, textarea, select, a')
                        ) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedWidgetId(widget.id);
                        lastReorderTimeRef.current = Date.now();
                        const dt = (e as unknown as React.DragEvent<HTMLElement>)
                          .dataTransfer;
                        if (dt) {
                          dt.effectAllowed = 'move';
                          dt.setData('text/plain', widget.id);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const dt = (e as unknown as React.DragEvent<HTMLElement>)
                          .dataTransfer;
                        if (dt) {
                          dt.dropEffect = 'move';
                        }
                        if (draggedWidgetId && draggedWidgetId !== widget.id) {
                          setDragOverWidgetId(widget.id);
                          const now = Date.now();
                          if (now - lastReorderTimeRef.current > 150) {
                            lastReorderTimeRef.current = now;
                            reorderWidgets(draggedWidgetId, widget.id);
                          }
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const dt = (e as unknown as React.DragEvent<HTMLElement>)
                          .dataTransfer;
                        const sourceId =
                          draggedWidgetId || (dt ? dt.getData('text/plain') : '');
                        if (sourceId && sourceId !== widget.id) {
                          reorderWidgets(sourceId, widget.id);
                        }
                        setDraggedWidgetId(null);
                        setDragOverWidgetId(null);
                        setDragHandleArmedId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedWidgetId(null);
                        setDragOverWidgetId(null);
                        setDragHandleArmedId(null);
                      }}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, scale: 0.96, y: 12 }
                      }
                      animate={{
                        opacity: 1,
                        scale: prefersReducedMotion
                          ? 1
                          : isBeingDragged
                          ? 0.985
                          : isDragTarget
                          ? 1.01
                          : 1,
                        y: 0,
                      }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.95, y: -10 }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              layout: {
                                type: 'spring',
                                stiffness: 360,
                                damping: 32,
                                mass: 0.85,
                              },
                              opacity: { duration: 0.2 },
                              scale: {
                                type: 'spring',
                                stiffness: 420,
                                damping: 28,
                              },
                              y: { duration: 0.2 },
                            }
                      }
                      className={`${colSpanClass} group/widget rounded-2xl bg-white dark:bg-[#14161F] border p-5 flex flex-col justify-between transition-[box-shadow,border-color] duration-200 relative ${
                        isBeingDragged
                          ? 'opacity-75 ring-2 ring-amber-500/80 border-amber-500 shadow-2xl z-30'
                          : isDragTarget
                          ? 'border-amber-500/80 ring-2 ring-amber-500/40 shadow-lg z-20'
                          : isRecentlyMoved
                          ? 'border-amber-500/70 ring-1 ring-amber-500/35 shadow-md z-10'
                          : isCustomizingLayout
                          ? 'border-amber-500/40 dark:border-amber-500/35 cursor-grab active:cursor-grabbing'
                          : 'border-stone-200/85 dark:border-stone-800/90'
                      }`}
                    >
                      {/* Subtle Quick Reorder & Drag Handle in Standard View (top-right corner on hover/focus) */}
                      {!isCustomizingLayout && (
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 rounded-lg bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800/80 px-1 py-0.5 shadow-2xs opacity-0 group-hover/widget:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={!canMovePrev}
                            onClick={() =>
                              moveWidgetByStep(widget.id, -1, displayedWidgets)
                            }
                            title="Move widget earlier in grid"
                            aria-label={`Move ${widget.title} earlier`}
                            className="p-0.5 rounded text-stone-400 hover:text-stone-800 dark:hover:text-amber-400 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <div
                            onMouseDown={() => setDragHandleArmedId(widget.id)}
                            onMouseUp={() => setDragHandleArmedId(null)}
                            onTouchStart={() => setDragHandleArmedId(widget.id)}
                            onTouchEnd={() => setDragHandleArmedId(null)}
                            title="Drag to reorder widget"
                            aria-label={`Drag handle to reorder ${widget.title}`}
                            className="p-0.5 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-amber-400 cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <button
                            type="button"
                            disabled={!canMoveNext}
                            onClick={() =>
                              moveWidgetByStep(widget.id, 1, displayedWidgets)
                            }
                            title="Move widget later in grid"
                            aria-label={`Move ${widget.title} later`}
                            className="p-0.5 rounded text-stone-400 hover:text-stone-800 dark:hover:text-amber-400 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Optional In-Place Edit Toolbar when Customize Layout Mode is active */}
                      <AnimatePresence initial={false}>
                        {isCustomizingLayout && (
                          <motion.div
                            layout="position"
                            initial={
                              prefersReducedMotion
                                ? false
                                : { opacity: 0, scale: 0.98 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            onMouseDown={() => setDragHandleArmedId(widget.id)}
                            onTouchStart={() => setDragHandleArmedId(widget.id)}
                            className="mb-3 pb-2.5 border-b border-dashed border-amber-500/50 flex flex-wrap items-center justify-between gap-2 bg-amber-50/60 dark:bg-amber-950/25 -mx-2 px-2.5 py-1.5 rounded-lg cursor-grab active:cursor-grabbing select-none"
                          >
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                              <GripVertical className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                              <span>
                                {t.dragToReorder} ·{' '}
                                {localizeWidgetTitle(
                                  widget.type,
                                  widget.title,
                                  lang
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Step Reorder Controls for Smooth LayoutGroup Transitions */}
                              <div className="flex items-center rounded-md bg-white/90 dark:bg-stone-800 border border-amber-500/30 p-0.5">
                                <button
                                  type="button"
                                  disabled={!canMovePrev}
                                  onClick={() =>
                                    moveWidgetByStep(
                                      widget.id,
                                      -1,
                                      displayedWidgets
                                    )
                                  }
                                  title="Move widget earlier"
                                  aria-label={`Move ${widget.title} earlier`}
                                  className="p-0.5 rounded text-stone-600 dark:text-stone-300 hover:bg-amber-100/70 dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={!canMoveNext}
                                  onClick={() =>
                                    moveWidgetByStep(
                                      widget.id,
                                      1,
                                      displayedWidgets
                                    )
                                  }
                                  title="Move widget later"
                                  aria-label={`Move ${widget.title} later`}
                                  className="p-0.5 rounded text-stone-600 dark:text-stone-300 hover:bg-amber-100/70 dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Animated Width Span Selector inside LayoutGroup */}
                              <div className="flex items-center rounded-md bg-white/90 dark:bg-stone-800 border border-amber-500/30 p-0.5">
                                {([1, 2, 3] as WidgetSpan[]).map((sp) => {
                                  const isSelected = widget.span === sp;
                                  return (
                                    <button
                                      key={sp}
                                      type="button"
                                      onClick={() =>
                                        changeWidgetSpan(widget.id, sp)
                                      }
                                      className={`relative px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                                        isSelected
                                          ? 'text-white dark:text-stone-950 font-semibold'
                                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                                      }`}
                                    >
                                      {isSelected && (
                                        <motion.span
                                          layoutId={`span-pill-${widget.id}`}
                                          transition={{
                                            type: 'spring',
                                            stiffness: 420,
                                            damping: 32,
                                          }}
                                          className="absolute inset-0 rounded bg-amber-700 dark:bg-amber-500"
                                        />
                                      )}
                                      <span className="relative z-10">
                                        {sp}col
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleWidgetVisibility(widget.id)}
                                className="p-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                                title="Hide widget"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Render Specific Widget Content */}
                      {widget.type === 'zmanim' && (
                        <ZmanimWidget
                          zmanim={localizedZmanim}
                          selectedDate={selectedDate}
                          onChangeDate={setSelectedDate}
                          shita={shita}
                          onChangeShita={handleSelectShita}
                          location={location}
                        />
                      )}

                      {widget.type === 'mini_calendar' && (
                        <MiniCalendarWidget
                          selectedDate={selectedDate}
                          onSelectDate={jumpToSpecificDate}
                        />
                      )}

                      {widget.type === 'upcoming_holidays' && (
                        <UpcomingHolidaysWidget
                          selectedDate={selectedDate}
                          location={location}
                          onSelectDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'chayenu_daily' && (
                        <ChayenuDailyWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          parsha={parsha}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'shiurim_tracker' && (
                        <ShiurimTrackerWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'rambam_daily' && (
                        <RambamDailyWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'geulah_moshiach' && (
                        <GeulahMoshiachWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'hayom_yom' && (
                        <HaYomYomWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'daily_tehillim' && (
                        <DailyTehillimWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'daf_yomi' && (
                        <DafYomiWidget
                          selectedDate={selectedDate}
                          onChangeDate={setSelectedDate}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'daily_thought' && (
                        <DailyThoughtWidget
                          selectedDate={selectedDate}
                          parshaNameEn={parsha?.nameEn}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'prayer_direction' && (
                        <PrayerDirectionWidget
                          location={location}
                          onUpdateLocation={setLocation}
                        />
                      )}

                      {widget.type === 'daily_minyan' && (
                        <DailyMinyanWidget zmanim={localizedZmanim} />
                      )}

                      {widget.type === 'weather' && localizedWeather && (
                        <WeatherWidget
                          weather={localizedWeather}
                          location={location}
                        />
                      )}

                      {widget.type === 'parsha' && parsha && (
                        <ParshaWidget
                          parsha={parsha}
                          location={location}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'limud' && (
                        <LimudWidget
                          limud={limud}
                          dateStr={localizedZmanim.dateStr}
                          onOpenReader={(ref, title) =>
                            setReaderRef({ ref, title })
                          }
                        />
                      )}

                      {widget.type === 'shabbat_prep' && parsha && (
                        <ShabbatPrepWidget parsha={parsha} />
                      )}

                      {widget.type === 'tzedakah' && <TzedakahWidget />}

                      {widget.type === 'notes' && (
                        <NotesWidget
                          selectedDate={selectedDate}
                          onChangeDate={jumpToSpecificDate}
                        />
                      )}

                      {widget.type === 'world_clocks' && (
                        <WorldClocksWidget
                          onSelectCity={(locId) => {
                            const found = PRESET_LOCATIONS.find(
                              (l) => l.id === locId
                            );
                            if (found) setLocation(found);
                          }}
                        />
                      )}

                      {widget.type === 'custom' && (
                        <CustomUserWidget
                          widget={widget}
                          onUpdateWidget={updateWidgetInstance}
                        />
                      )}
                    </motion.section>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </LayoutGroup>
        )}

        {/* Quiet Editorial Footer with Add Widget Affordance */}
        <footer className="mt-12 pt-6 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div>
            Orah Personal Luach & Homescreen · Astronomical Zmanim, Sefaria Study & Open-Meteo Forecast
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5 text-stone-400" />
              <span>Export / Import Configuration</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
            >
              + Add or Configure Widgets ({widgets.filter((w) => w.visible).length} active)
            </button>
          </div>
        </footer>
      </main>

      {/* Bilingual Sefaria Reader Modal */}
      <SefariaReaderModal
        refString={readerRef.ref}
        title={readerRef.title}
        autoStartVoice={readerRef.autoStartVoice}
        onNavigateRef={(newRef, newTitle) =>
          setReaderRef({ ref: newRef, title: newTitle, autoStartVoice: false })
        }
        onClose={() =>
          setReaderRef({ ref: null, title: '', autoStartVoice: false })
        }
      />

      {/* Widget Gallery & Custom Widget Studio Modal */}
      <WidgetGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        widgets={widgets}
        onToggleWidget={toggleWidgetVisibility}
        onChangeSpan={changeWidgetSpan}
        onReorderWidgets={reorderWidgets}
        onAddCustomWidget={addCustomWidget}
        onDeleteCustomWidget={deleteCustomWidget}
        onApplyPreset={applyPreset}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Workspace Settings & Export/Import Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        widgets={widgets}
        location={location}
        shita={shita}
        darkMode={darkMode}
        onApplyImport={handleApplyImport}
        onResetDefaults={handleResetDefaults}
        onChangeShita={handleSelectShita}
        onChangeLocation={setLocation}
      />

      {/* First-Visit Interactive Welcome Tutorial Modal */}
      <OnboardingTutorialModal
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        shita={shita}
        onChangeShita={handleSelectShita}
        location={location}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onToggleEditGrid={() => setIsCustomizingLayout(true)}
        onOpenVoiceSearch={() =>
          setReaderRef({
            ref: parsha?.fullRef || 'Berakhot 2a',
            title: parsha
              ? `${parsha.nameEn} · ${parsha.nameHe}`
              : 'Berakhot 2a · מסכת ברכות',
            autoStartVoice: true,
          })
        }
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
