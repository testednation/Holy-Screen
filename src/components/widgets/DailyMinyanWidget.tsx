import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  Check,
} from 'lucide-react';
import {
  MinyanScheduleItem,
  MinyanServiceType,
  SynagogueConfig,
  ZmanimData,
} from '../../types/dashboard';

interface DailyMinyanWidgetProps {
  zmanim: ZmanimData;
}

const SERVICE_HEBREW: Record<MinyanServiceType, string> = {
  Shacharis: 'שחרית',
  Mincha: 'מנחה',
  Maariv: 'מעריב',
};

const DEFAULT_SYNAGOGUE_CONFIG: SynagogueConfig = {
  shulName: 'Beit Midrash Ohel Menachem',
  nusach: 'Nusach Ari · Chabad',
  schedule: [
    {
      id: 'min-1',
      service: 'Shacharis',
      time24: '07:00',
      locationNote: 'Early Vasikin Sanctuary',
    },
    {
      id: 'min-2',
      service: 'Shacharis',
      time24: '08:15',
      locationNote: 'Main Beit Midrash',
    },
    {
      id: 'min-3',
      service: 'Mincha',
      time24: '13:30',
      locationNote: 'Mincha Gedolah · Side Chapel',
    },
    {
      id: 'min-4',
      service: 'Mincha',
      time24: '16:40',
      locationNote: 'Erev Shkiah · Main Sanctuary',
    },
    {
      id: 'min-5',
      service: 'Maariv',
      time24: '17:25',
      locationNote: 'Bizmano (Tzeit HaKochavim)',
    },
    {
      id: 'min-6',
      service: 'Maariv',
      time24: '21:00',
      locationNote: 'Night Seder Minyan',
    },
  ],
};

function format24To12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function dateTo24TimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export const DailyMinyanWidget: React.FC<DailyMinyanWidgetProps> = ({ zmanim }) => {
  const [config, setConfig] = useState<SynagogueConfig>(() => {
    try {
      const saved = localStorage.getItem('orah_daily_minyan_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SYNAGOGUE_CONFIG;
  });

  const [now, setNow] = useState<Date>(() => new Date());
  const [serviceFilter, setServiceFilter] = useState<'ALL' | MinyanServiceType>('ALL');
  const [isEditingShul, setIsEditingShul] = useState<boolean>(false);
  const [shulNameDraft, setShulNameDraft] = useState<string>(config.shulName);
  const [nusachDraft, setNusachDraft] = useState<string>(config.nusach);

  // New Minyan Input State
  const [newService, setNewService] = useState<MinyanServiceType>('Mincha');
  const [newTime24, setNewTime24] = useState<string>('17:00');
  const [newNote, setNewNote] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('orah_daily_minyan_v1', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const sortedSchedule = useMemo(() => {
    return [...config.schedule].sort((a, b) => a.time24.localeCompare(b.time24));
  }, [config.schedule]);

  // Calculate exact Date instance for each Minyan today, and find the next upcoming session
  const { nextSession, isTomorrowSession, countdownStr } = useMemo(() => {
    if (sortedSchedule.length === 0) {
      return {
        nextSession: null,
        isTomorrowSession: false,
        countdownStr: '00:00:00',
      };
    }

    const buildTodayDate = (t24: string, dayOffset = 0): Date => {
      const [hStr, mStr] = t24.split(':');
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(parseInt(hStr || '0', 10), parseInt(mStr || '0', 10), 0, 0);
      return d;
    };

    let chosenItem: MinyanScheduleItem | null = null;
    let targetDate: Date | null = null;
    let isTomorrow = false;

    for (const item of sortedSchedule) {
      const dt = buildTodayDate(item.time24, 0);
      if (dt.getTime() > now.getTime()) {
        chosenItem = item;
        targetDate = dt;
        break;
      }
    }

    // If all of today's Minyanim have passed, wrap around to tomorrow's first Shacharis/Minyan
    if (!chosenItem) {
      chosenItem = sortedSchedule[0];
      targetDate = buildTodayDate(chosenItem.time24, 1);
      isTomorrow = true;
    }

    const diffMs = Math.max(0, targetDate!.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const formattedCountdown = `${String(hrs).padStart(2, '0')}:${String(
      mins
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return {
      nextSession: chosenItem,
      isTomorrowSession: isTomorrow,
      countdownStr: formattedCountdown,
    };
  }, [sortedSchedule, now]);

  const filteredSchedule = useMemo(() => {
    if (serviceFilter === 'ALL') return sortedSchedule;
    return sortedSchedule.filter((s) => s.service === serviceFilter);
  }, [sortedSchedule, serviceFilter]);

  const handleAddMinyan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime24) return;
    const item: MinyanScheduleItem = {
      id: `min-${Date.now()}`,
      service: newService,
      time24: newTime24,
      locationNote: newNote.trim() || `${newService} Minyan`,
    };
    setConfig((prev) => ({
      ...prev,
      schedule: [...prev.schedule, item],
    }));
    setNewNote('');
  };

  const handleRemoveMinyan = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== id),
    }));
  };

  const handleSaveShulHeader = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig((prev) => ({
      ...prev,
      shulName: shulNameDraft.trim() || prev.shulName,
      nusach: nusachDraft.trim() || prev.nusach,
    }));
    setIsEditingShul(false);
  };

  // Sync Erev Shkiah Mincha (15m before Sunset) and Maariv (Tzeit) with today's Zmanim
  const handleSyncWithZmanim = () => {
    const minchaBeforeShkiah = new Date(zmanim.sunset.getTime() - 15 * 60000);
    const tzeitItem = zmanim.items.find((i) => i.id === 'tzeit');
    const maarivTime = tzeitItem
      ? tzeitItem.time
      : new Date(zmanim.sunset.getTime() + 42 * 60000);

    const mincha24 = dateTo24TimeString(minchaBeforeShkiah);
    const maariv24 = dateTo24TimeString(maarivTime);

    setConfig((prev) => {
      const kept = prev.schedule.filter(
        (s) =>
          !s.locationNote.includes('Synced to Shkiah') &&
          !s.locationNote.includes('Synced to Tzeit')
      );
      return {
        ...prev,
        schedule: [
          ...kept,
          {
            id: `sync-mincha-${Date.now()}`,
            service: 'Mincha',
            time24: mincha24,
            locationNote: '15m before Shkiah (Synced to Shkiah)',
          },
          {
            id: `sync-maariv-${Date.now() + 1}`,
            service: 'Maariv',
            time24: maariv24,
            locationNote: 'Tzeit HaKochavim (Synced to Tzeit)',
          },
        ],
      };
    });
  };

  const nowTime24 = dateTo24TimeString(now);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="min-w-0 flex-1">
            {isEditingShul ? (
              <form onSubmit={handleSaveShulHeader} className="space-y-1.5 pr-2">
                <input
                  type="text"
                  value={shulNameDraft}
                  onChange={(e) => setShulNameDraft(e.target.value)}
                  placeholder="Synagogue / Organization Name"
                  className="w-full text-xs font-semibold px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nusachDraft}
                    onChange={(e) => setNusachDraft(e.target.value)}
                    placeholder="Nusach (e.g. Ashkenaz, Sefard, Ari)"
                    className="flex-1 text-[11px] px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-medium bg-amber-700 text-white rounded hover:bg-amber-800 inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 truncate">
                  <span className="truncate font-medium text-stone-700 dark:text-stone-300">
                    {config.shulName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{config.nusach}</span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
                  Daily Minyan · לוח תפילות ומניינים
                </h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSyncWithZmanim}
              title="Auto-calculate Mincha (15m before Shkiah) & Maariv (Tzeit) from today's Zmanim"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" />
              Sync Zmanim
            </button>
            <button
              type="button"
              onClick={() => {
                setShulNameDraft(config.shulName);
                setNusachDraft(config.nusach);
                setIsEditingShul((v) => !v);
              }}
              title="Edit Synagogue Name & Nusach"
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Countdown Banner to Next Upcoming Prayer Session */}
        {nextSession && (
          <div className="my-3 p-3.5 rounded-xl bg-stone-950 text-stone-100 border border-stone-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>
                  {isTomorrowSession ? 'Tomorrow’s First Minyan' : 'Next Upcoming Minyan'}
                </span>
              </div>
              <div className="text-base font-semibold text-white mt-0.5 truncate">
                {nextSession.service} · {SERVICE_HEBREW[nextSession.service]}{' '}
                <span className="font-mono tabular-nums text-amber-400">
                  ({format24To12(nextSession.time24)})
                </span>
              </div>
              <div className="text-[11px] text-stone-400 truncate mt-0.5">
                {nextSession.locationNote}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-stone-400">Countdown</div>
              <div className="text-xl font-mono tabular-nums font-bold text-amber-400 tracking-tight">
                {countdownStr}
              </div>
            </div>
          </div>
        )}

        {/* Service Filter Segmented Bar */}
        <div
          className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700 mb-2"
          role="group"
          aria-label="Filter by Prayer Service"
        >
          {(
            [
              { id: 'ALL', label: `All (${config.schedule.length})` },
              { id: 'Shacharis', label: 'Shacharis · שחרית' },
              { id: 'Mincha', label: 'Mincha · מנחה' },
              { id: 'Maariv', label: 'Maariv · מעריב' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setServiceFilter(tab.id)}
              className={`flex-1 py-1 px-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                serviceFilter === tab.id
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Minyan Schedule Rows */}
        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 max-h-48 overflow-y-auto pr-0.5">
          {filteredSchedule.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-400">
              No {serviceFilter === 'ALL' ? '' : serviceFilter} Minyanim listed yet. Add a time below.
            </div>
          ) : (
            filteredSchedule.map((item) => {
              const isNext =
                !isTomorrowSession && nextSession?.id === item.id;
              const isPassed = item.time24 <= nowTime24;

              return (
                <div
                  key={item.id}
                  className={`py-2 px-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${
                    isNext
                      ? 'bg-amber-50/80 dark:bg-amber-950/30'
                      : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold ${
                          isPassed && !isNext
                            ? 'text-stone-500 dark:text-stone-400'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {item.service}
                      </span>
                      <span className="text-stone-400 dark:text-stone-500">
                        · {SERVICE_HEBREW[item.service]}
                      </span>
                      {isNext && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          · Next Up
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {item.locationNote}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        isNext
                          ? 'text-amber-700 dark:text-amber-400'
                          : isPassed
                          ? 'text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {format24To12(item.time24)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMinyan(item.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove Minyan time"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Service Time Form */}
      <form
        onSubmit={handleAddMinyan}
        className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center gap-1.5"
      >
        <select
          value={newService}
          onChange={(e) => setNewService(e.target.value as MinyanServiceType)}
          aria-label="Select Prayer Service"
          className="text-xs px-2 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
        >
          <option value="Shacharis">Shacharis</option>
          <option value="Mincha">Mincha</option>
          <option value="Maariv">Maariv</option>
        </select>

        <input
          type="time"
          required
          value={newTime24}
          onChange={(e) => setNewTime24(e.target.value)}
          aria-label="Minyan Time"
          className="text-xs font-mono tabular-nums px-2 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
        />

        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Room or note..."
          className="flex-1 min-w-[95px] text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
        />

        <button
          type="submit"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </form>
    </div>
  );
};
