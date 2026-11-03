import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  X,
  Clock,
  Check,
  Sparkles,
  Play,
} from 'lucide-react';
import { ZmanimData, ZmanItem } from '../types/dashboard';
import { AppLanguage } from './LanguageControl';

export interface ProximityAlertSettings {
  enabled: boolean;
  soundEnabled: boolean;
  leadMinutes: number; // default 15 minutes
  watchedIds: string[];
}

const DEFAULT_WATCHED_IDS = [
  'sunrise',
  'shema_gra',
  'shema_mga',
  'tefillah',
  'mincha_ketanah',
  'plag',
  'sunset',
  'tzeit',
];

const STORAGE_KEY = 'orah_zmanim_proximity_alerts_v1';

function loadSettings(): ProximityAlertSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
        soundEnabled:
          typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        leadMinutes:
          typeof parsed.leadMinutes === 'number' ? parsed.leadMinutes : 15,
        watchedIds: Array.isArray(parsed.watchedIds)
          ? parsed.watchedIds
          : DEFAULT_WATCHED_IDS,
      };
    }
  } catch {
    // ignore
  }
  return {
    enabled: true,
    soundEnabled: true,
    leadMinutes: 15,
    watchedIds: DEFAULT_WATCHED_IDS,
  };
}

/**
 * Synthesizes a warm, subtle two-note sanctuary chime using the Web Audio API.
 * Uses pure sine + soft triangle overtones at 528 Hz (C5) -> 660 Hz (E5) with gentle exponential decay.
 */
export function playSubtleSanctuaryChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playNote = (freq: number, startOffset: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 1.5, now + startOffset);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.12, now + startOffset);

      gain.gain.setValueAtTime(0.0001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + startOffset + duration
      );

      osc.connect(gain);
      subOsc.connect(subGain);
      subGain.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + startOffset);
      subOsc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.05);
      subOsc.stop(now + startOffset + duration + 0.05);
    };

    // Gentle ascending fifth/third interval chime
    playNote(528, 0, 1.4, 0.14);
    playNote(660, 0.28, 1.8, 0.12);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2400);
  } catch {
    // AudioContext blocked or unsupported
  }
}

const ALERT_LABELS: Record<
  AppLanguage,
  {
    buttonLabel: string;
    activeAlertBadge: string;
    popoverTitle: string;
    popoverSubtitle: string;
    enableAlerts: string;
    subtleChime: string;
    leadTimeLabel: string;
    minutesBefore: string;
    watchedThresholds: string;
    testAlertBtn: string;
    approachingBadge: string;
    inMinutes: string;
    dismiss: string;
    nextWatchedLabel: string;
    simulatedPreviewTag: string;
  }
> = {
  en: {
    buttonLabel: 'Zman Alerts',
    activeAlertBadge: 'Approaching',
    popoverTitle: 'Zmanim Proximity Alerts · התראת זמנים',
    popoverSubtitle:
      'Visual notification & subtle sanctuary chime before key Halachic thresholds',
    enableAlerts: 'Proximity Notifications',
    subtleChime: 'Subtle Acoustic Chime',
    leadTimeLabel: 'Alert Lead Time',
    minutesBefore: 'min before',
    watchedThresholds: 'Monitored Halachic Thresholds',
    testAlertBtn: 'Test 15m Proximity Alert & Chime',
    approachingBadge: 'Halachic Threshold Approaching',
    inMinutes: 'remaining',
    dismiss: 'Acknowledge',
    nextWatchedLabel: 'Next monitored threshold',
    simulatedPreviewTag: 'Preview Mode',
  },
  fr: {
    buttonLabel: 'Alertes Zmanim',
    activeAlertBadge: 'Proche',
    popoverTitle: 'Alertes de Proximité Zmanim · התראת זמנים',
    popoverSubtitle:
      'Notification visuelle et carillon subtil avant les heures limites halakhiques',
    enableAlerts: 'Notifications de proximité',
    subtleChime: 'Carillon acoustique subtil',
    leadTimeLabel: 'Délai d’alerte',
    minutesBefore: 'min avant',
    watchedThresholds: 'Zmanim surveillés',
    testAlertBtn: 'Tester l’alerte 15m & le carillon',
    approachingBadge: 'Seuil Halakhique Imminent',
    inMinutes: 'restantes',
    dismiss: 'Compris',
    nextWatchedLabel: 'Prochain seuil surveillé',
    simulatedPreviewTag: 'Aperçu',
  },
  es: {
    buttonLabel: 'Alertas Zmanim',
    activeAlertBadge: 'Próximo',
    popoverTitle: 'Alertas de Proximidad Zmanim · התראת זמנים',
    popoverSubtitle:
      'Notificación visual y campanilla sutil antes de los límites halájicos',
    enableAlerts: 'Notificaciones de proximidad',
    subtleChime: 'Campanilla acústica sutil',
    leadTimeLabel: 'Tiempo de anticipación',
    minutesBefore: 'min antes',
    watchedThresholds: 'Umbrales Halájicos Monitoreados',
    testAlertBtn: 'Probar alerta de 15m y sonido',
    approachingBadge: 'Umbral Halájico Próximo',
    inMinutes: 'restantes',
    dismiss: 'Entendido',
    nextWatchedLabel: 'Próximo umbral monitoreado',
    simulatedPreviewTag: 'Vista previa',
  },
  ru: {
    buttonLabel: 'Оповещения',
    activeAlertBadge: 'Скоро',
    popoverTitle: 'Оповещения о Зманим · התראת זמנים',
    popoverSubtitle:
      'Визуальное уведомление и мягкий сигнал за 15 минут до важных галахических времён',
    enableAlerts: 'Уведомления о приближении',
    subtleChime: 'Мягкий звуковой сигнал',
    leadTimeLabel: 'Время предупреждения',
    minutesBefore: 'мин до',
    watchedThresholds: 'Отслеживаемые галахические времена',
    testAlertBtn: 'Проверить сигнал и уведомление (15м)',
    approachingBadge: 'Приближается галахическое время',
    inMinutes: 'осталось',
    dismiss: 'Понятно',
    nextWatchedLabel: 'Следующее отслеживаемое время',
    simulatedPreviewTag: 'Предпросмотр',
  },
};

interface ActiveProximityAlert {
  item: ZmanItem;
  secondsRemaining: number;
  isPreview?: boolean;
}

interface ZmanimProximityAlertProps {
  zmanim: ZmanimData;
  isSelectedToday: boolean;
  lang?: AppLanguage;
}

export const ZmanimProximityAlertControl: React.FC<ZmanimProximityAlertProps> = ({
  zmanim,
  isSelectedToday,
  lang = 'en',
}) => {
  const [settings, setSettings] = useState<ProximityAlertSettings>(loadSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [dismissedKeys, setDismissedKeys] = useState<Record<string, boolean>>({});
  const [previewAlert, setPreviewAlert] = useState<ActiveProximityAlert | null>(
    null
  );

  const chimedKeysRef = useRef<Record<string, boolean>>({});
  const labels = ALERT_LABELS[lang] || ALERT_LABELS.en;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine the next watched Zman
  const watchedItems = useMemo(() => {
    return zmanim.items
      .filter((item) => settings.watchedIds.includes(item.id))
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [zmanim.items, settings.watchedIds]);

  const nextWatchedItem = useMemo(() => {
    return (
      watchedItems.find((item) => item.time.getTime() > now.getTime()) ||
      watchedItems.find((item) => item.id === 'plag' || item.id === 'sunset') ||
      watchedItems[0] ||
      null
    );
  }, [watchedItems, now]);

  // Evaluate live proximity window (within settings.leadMinutes before the Zman)
  const liveProximityAlert = useMemo((): ActiveProximityAlert | null => {
    if (!settings.enabled || !isSelectedToday) return null;
    const leadMs = settings.leadMinutes * 60 * 1000;

    for (const item of watchedItems) {
      const diffMs = item.time.getTime() - now.getTime();
      if (diffMs > 0 && diffMs <= leadMs) {
        const alertKey = `${zmanim.dateStr}:${item.id}`;
        if (dismissedKeys[alertKey]) continue;
        return {
          item,
          secondsRemaining: Math.max(1, Math.floor(diffMs / 1000)),
          isPreview: false,
        };
      }
    }
    return null;
  }, [
    settings.enabled,
    settings.leadMinutes,
    isSelectedToday,
    watchedItems,
    now,
    zmanim.dateStr,
    dismissedKeys,
  ]);

  // Trigger subtle chime once when entering the proximity window
  useEffect(() => {
    if (!liveProximityAlert || liveProximityAlert.isPreview) return;
    const alertKey = `${zmanim.dateStr}:${liveProximityAlert.item.id}`;
    if (!chimedKeysRef.current[alertKey]) {
      chimedKeysRef.current[alertKey] = true;
      if (settings.soundEnabled) {
        playSubtleSanctuaryChime();
      }
    }
  }, [liveProximityAlert, zmanim.dateStr, settings.soundEnabled]);

  const activeAlert = previewAlert || liveProximityAlert;

  const handleToggleWatched = (id: string) => {
    setSettings((prev) => {
      const exists = prev.watchedIds.includes(id);
      const nextIds = exists
        ? prev.watchedIds.filter((x) => x !== id)
        : [...prev.watchedIds, id];
      return {
        ...prev,
        watchedIds: nextIds,
      };
    });
  };

  const handleTriggerPreview = useCallback(() => {
    const sampleItem =
      zmanim.items.find(
        (i) =>
          (i.id === 'plag' || i.id === 'sunset') &&
          i.time.getTime() > now.getTime()
      ) ||
      zmanim.items.find((i) => i.id === 'plag') ||
      zmanim.items.find((i) => i.id === 'sunset') ||
      zmanim.items[0];

    if (settings.soundEnabled) {
      playSubtleSanctuaryChime();
    }

    if (sampleItem) {
      setPreviewAlert({
        item: sampleItem,
        secondsRemaining: settings.leadMinutes * 60,
        isPreview: true,
      });
    }
    setIsOpen(false);
  }, [zmanim.items, now, settings.soundEnabled, settings.leadMinutes]);

  // Tick down preview alert if active
  useEffect(() => {
    if (!previewAlert) return;
    const timer = setInterval(() => {
      setPreviewAlert((prev) => {
        if (!prev || prev.secondsRemaining <= 1) return null;
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [previewAlert]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDismissActive = () => {
    if (previewAlert) {
      setPreviewAlert(null);
      return;
    }
    if (liveProximityAlert) {
      const alertKey = `${zmanim.dateStr}:${liveProximityAlert.item.id}`;
      setDismissedKeys((prev) => ({ ...prev, [alertKey]: true }));
    }
  };

  return (
    <div className="relative">
      {/* Control Pill in Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
          activeAlert
            ? 'bg-amber-600 text-white border-amber-600 shadow-sm animate-pulse'
            : settings.enabled
            ? 'bg-white dark:bg-[#14161F] border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-600/60'
            : 'bg-stone-100/80 dark:bg-stone-900 border-stone-200/60 dark:border-stone-800 text-stone-400 dark:text-stone-500'
        }`}
        title={labels.popoverTitle}
      >
        {activeAlert ? (
          <BellRing className="w-3.5 h-3.5 text-amber-100" />
        ) : (
          <Bell
            className={`w-3.5 h-3.5 ${
              settings.enabled
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-stone-400'
            }`}
          />
        )}
        <span>{labels.buttonLabel}</span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            activeAlert
              ? 'bg-amber-800/60 text-amber-100'
              : settings.enabled
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              : 'bg-stone-200/60 dark:bg-stone-800 text-stone-500'
          }`}
        >
          {settings.enabled ? `${settings.leadMinutes}m` : 'OFF'}
        </span>
      </button>

      {/* Configuration Popover */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-40 w-80 sm:w-96 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                {labels.popoverTitle}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {labels.popoverSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {labels.enableAlerts}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  settings.enabled
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {settings.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                )}
                {labels.subtleChime}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextSound = !settings.soundEnabled;
                  setSettings((prev) => ({ ...prev, soundEnabled: nextSound }));
                  if (nextSound) {
                    playSubtleSanctuaryChime();
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  settings.soundEnabled
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {settings.soundEnabled ? 'Chime ON' : 'Muted'}
              </button>
            </div>

            {/* Lead Time Selector (5m / 10m / 15m / 30m) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {labels.leadTimeLabel}
              </span>
              <div className="flex items-center gap-1">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, leadMinutes: mins }))
                    }
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      settings.leadMinutes === mins
                        ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 font-semibold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Monitored Zmanim Checklist */}
          <div className="py-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              {labels.watchedThresholds}
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {zmanim.items.map((item) => {
                const isWatched = settings.watchedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleWatched(item.id)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-[11px] border transition-colors ${
                      isWatched
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300/70 dark:border-amber-800/70 text-stone-900 dark:text-stone-100'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="font-medium truncate">{item.titleEn}</div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {item.formattedTime}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isWatched
                          ? 'bg-amber-700 text-white'
                          : 'border border-stone-300 dark:border-stone-700'
                      }`}
                    >
                      {isWatched && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Monitored Threshold + Test Button */}
          <div className="pt-3 flex flex-col gap-2">
            {nextWatchedItem && (
              <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-100/80 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300">
                <span className="truncate">
                  {labels.nextWatchedLabel}:{' '}
                  <strong className="text-stone-900 dark:text-stone-100">
                    {nextWatchedItem.titleEn}
                  </strong>
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 ml-2 shrink-0">
                  {nextWatchedItem.formattedTime}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTriggerPreview}
              className="w-full py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800/70 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {labels.testAlertBtn}
            </button>
          </div>
        </div>
      )}

      {/* Floating Visual Proximity Notification Banner */}
      {activeAlert && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-96 rounded-2xl bg-gradient-to-br from-[#1C1813] via-[#231E17] to-[#171410] text-amber-50 border border-amber-500/40 shadow-2xl p-4 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                    {labels.approachingBadge}
                  </span>
                  {activeAlert.isPreview && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-200 border border-amber-400/30">
                      {labels.simulatedPreviewTag}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white leading-snug mt-0.5">
                  {activeAlert.item.titleEn} ·{' '}
                  <span className="font-serif text-amber-200" dir="rtl">
                    {activeAlert.item.titleHe}
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissActive}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-300 mt-2 leading-relaxed">
            {activeAlert.item.description}
          </p>
          <p className="text-[11px] text-amber-200/80 mt-0.5">
            {activeAlert.item.halachicNote}
          </p>

          <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-mono font-semibold text-amber-200">
                {activeAlert.item.formattedTime}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                -{formatCountdown(activeAlert.secondsRemaining)}{' '}
                {labels.inMinutes}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => playSubtleSanctuaryChime()}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-200 transition-colors"
                title={labels.subtleChime}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDismissActive}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors"
              >
                {labels.dismiss}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
