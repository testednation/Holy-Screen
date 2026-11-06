import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  TzedakahEntry,
  RefuahEntry,
  WidgetInstance,
  ParshaData,
} from '../../types/dashboard';
import {
  PRESET_LOCATIONS,
  formatTimeInTz,
  buildZmanimFromAstronomy,
  getHebrewDateStrings,
  buildHebrewMonthGrid,
} from '../../services/halachaService';

// 1. EREV SHABBAT PREPARATION CHECKLIST WIDGET
interface PrepCheckItem {
  id: string;
  label: string;
  hebrewHint?: string;
  done: boolean;
}

const DEFAULT_PREP_ITEMS: PrepCheckItem[] = [
  {
    id: 'mikra',
    label: 'Complete Shnayim Mikra VeEchad Targum',
    hebrewHint: 'שניים מקרא ואחד תרגום',
    done: false,
  },
  {
    id: 'candles',
    label: 'Prepare Shabbat Nerot &olive oil / wicks',
    hebrewHint: 'הכנת נרות שבת',
    done: true,
  },
  {
    id: 'blech',
    label: 'Set hot water urn, Blech & Shabbat lamps',
    hebrewHint: 'פלטה ומיחם',
    done: false,
  },
  {
    id: 'clothes',
    label: 'Press Shabbat garments & polish shoes',
    hebrewHint: 'בגדי שבת לכבוד שבת',
    done: true,
  },
  {
    id: 'tzedakah',
    label: 'Give Erev Shabbat Tzedakah before candle lighting',
    hebrewHint: 'צדקה בערב שבת',
    done: false,
  },
  {
    id: 'pockets',
    label: 'Check pockets for muktzeh before Shkiah',
    hebrewHint: 'בדיקת כיסים',
    done: false,
  },
];

export const ShabbatPrepWidget: React.FC<{ parsha: ParshaData }> = ({ parsha }) => {
  const [items, setItems] = useState<PrepCheckItem[]>(() => {
    try {
      const saved = localStorage.getItem('orah_shabbat_prep_items');
      return saved ? JSON.parse(saved) : DEFAULT_PREP_ITEMS;
    } catch {
      return DEFAULT_PREP_ITEMS;
    }
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('orah_shabbat_prep_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `prep-${Date.now()}`, label: newTask.trim(), done: false },
    ]);
    setNewTask('');
  };

  const resetAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, done: false })));
  };

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Kavod Shabbat</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Candles {parsha.candleLighting}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Erev Shabbat Checklist · הכנות לשבת
            </h2>
          </div>

          <button
            type="button"
            onClick={resetAll}
            title="Reset checklist for new week"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-2 flex items-center justify-between gap-2 text-xs"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0 group"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    item.done
                      ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                      : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-600'
                  }`}
                >
                  {item.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span
                  className={`truncate font-medium ${
                    item.done
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {item.label}
                </span>
              </button>
              {item.hebrewHint && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
                  {item.hebrewHint}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={addItem}
        className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add Erev Shabbat task..."
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0"
        >
          Add ({doneCount}/{items.length})
        </button>
      </form>
    </div>
  );
};

// 2. MAASER & TZEDAKAH LEDGER WIDGET
const INITIAL_TZEDAKAH: TzedakahEntry[] = [
  {
    id: 'tz-1',
    date: 'Nov 1',
    description: 'Monthly Net Income Deposit',
    type: 'income',
    amount: 5400,
  },
  {
    id: 'tz-2',
    date: 'Nov 1',
    description: 'Hachnasat Orchim & Chesed Fund',
    type: 'donation',
    amount: 180,
  },
  {
    id: 'tz-3',
    date: 'Nov 1',
    description: 'Kupat Ha’ir / Local Beit Midrash',
    type: 'donation',
    amount: 120,
  },
];

export const TzedakahWidget: React.FC = () => {
  const [entries, setEntries] = useState<TzedakahEntry[]>(() => {
    try {
      const saved = localStorage.getItem('orah_tzedakah_ledger');
      return saved ? JSON.parse(saved) : INITIAL_TZEDAKAH;
    } catch {
      return INITIAL_TZEDAKAH;
    }
  });
  const [ratePct, setRatePct] = useState<10 | 20>(10);
  const [desc, setDesc] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [entryType, setEntryType] = useState<'donation' | 'income'>('donation');

  useEffect(() => {
    try {
      localStorage.setItem('orah_tzedakah_ledger', JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  const stats = useMemo(() => {
    const totalIncome = entries
      .filter((e) => e.type === 'income')
      .reduce((acc, e) => acc + e.amount, 0);
    const totalDonated = entries
      .filter((e) => e.type === 'donation')
      .reduce((acc, e) => acc + e.amount, 0);
    const obligation = (totalIncome * ratePct) / 100;
    const remaining = Math.max(0, obligation - totalDonated);
    return { totalIncome, totalDonated, obligation, remaining };
  }, [entries, ratePct]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountStr);
    if (!desc.trim() || isNaN(num) || num <= 0) return;
    const todayShort = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    setEntries((prev) => [
      {
        id: `tz-${Date.now()}`,
        date: todayShort,
        description: desc.trim(),
        type: entryType,
        amount: num,
      },
      ...prev,
    ]);
    setDesc('');
    setAmountStr('');
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Maaser Kesafim</span>
              <span aria-hidden="true">·</span>
              <span>{ratePct === 10 ? '10% Maaser' : '20% Chomesh'}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Maaser & Tzedakah · מעשר כספים
            </h2>
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setRatePct(10)}
              className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                ratePct === 10
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              10%
            </button>
            <button
              type="button"
              onClick={() => setRatePct(20)}
              className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                ratePct === 20
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              20%
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-3 gap-2 py-3 border-b border-stone-200/80 dark:border-stone-800 text-xs">
          <div>
            <span className="text-stone-500 dark:text-stone-400 block">
              {ratePct}% Obligation
            </span>
            <span className="text-base font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
              ${stats.obligation.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-stone-500 dark:text-stone-400 block">
              Given Tzedakah
            </span>
            <span className="text-base font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              ${stats.totalDonated.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-stone-500 dark:text-stone-400 block">
              Maaser Balance
            </span>
            <span className="text-base font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-400">
              ${stats.remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-1 max-h-40 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="py-2 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-medium text-stone-800 dark:text-stone-200 truncate">
                  {entry.description}
                </div>
                <div className="text-[11px] text-stone-400 dark:text-stone-500">
                  {entry.date} · {entry.type === 'income' ? 'Income' : 'Tzedakah'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-mono tabular-nums font-semibold ${
                    entry.type === 'income'
                      ? 'text-stone-600 dark:text-stone-300'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                  title="Remove entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Entry Form */}
      <form
        onSubmit={handleAddEntry}
        className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center gap-1.5"
      >
        <select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as 'donation' | 'income')}
          className="text-xs px-2 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
        >
          <option value="donation">Tzedakah</option>
          <option value="income">Income</option>
        </select>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Cause or source..."
          className="flex-1 min-w-[110px] text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
        />
        <input
          type="number"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="$"
          className="w-18 text-xs font-mono tabular-nums px-2 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
        />
        <button
          type="submit"
          className="px-2.5 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
        >
          Log
        </button>
      </form>
    </div>
  );
};

// 3. KAVANOT, DATE-SPECIFIC NOTES & REFUAH SHELEIMAH TEFILLAH LIST WIDGET
const INITIAL_REFUAH: RefuahEntry[] = [
  {
    id: 'ref-1',
    nameHe: 'יוסף חי בן רחל',
    nameEn: 'Yosef Chai ben Rachel',
    note: 'Refuah Sheleimah b’toch sh’ar cholei Yisrael',
  },
  {
    id: 'ref-2',
    nameHe: 'חנה בת שרה',
    nameEn: 'Chana bat Sarah',
    note: 'Tefillah during Refaeinu',
  },
];

export interface DateKavanahItem {
  id: string;
  text: string;
  category: 'kavanah' | 'reminder' | 'dvar_torah' | 'simcha';
  completed: boolean;
}

export interface DateNoteRecord {
  dateKey: string; // YYYY-MM-DD
  scratchpad: string;
  items: DateKavanahItem[];
  updatedAt: string;
}

export const DATE_NOTES_STORAGE_KEY = 'orah_date_notes_v1';

function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0);
}

function getUpcomingFridayKey(from: Date): string {
  const d = new Date(from);
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

const CATEGORY_META: Record<
  DateKavanahItem['category'],
  { label: string; hebrew: string; badgeClass: string }
> = {
  kavanah: {
    label: 'Kavanah',
    hebrew: 'כוונה',
    badgeClass:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  },
  reminder: {
    label: 'Reminder',
    hebrew: 'תזכורת',
    badgeClass:
      'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
  },
  dvar_torah: {
    label: 'Dvar Torah',
    hebrew: 'דבר תורה',
    badgeClass:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  simcha: {
    label: 'Yahrtzeit / Simcha',
    hebrew: 'אירוע / יארצייט',
    badgeClass:
      'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
  },
};

interface NotesWidgetProps {
  selectedDate?: Date;
  onChangeDate?: (next: Date) => void;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({
  selectedDate: propSelectedDate,
  onChangeDate,
}) => {
  const [internalDate, setInternalDate] = useState<Date>(() => new Date());
  const activeDate = propSelectedDate || internalDate;
  const activeDateKey = useMemo(() => toDateKey(activeDate), [activeDate]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const isToday = activeDateKey === todayKey;
  const isFuture = activeDateKey > todayKey;

  const hebrewDateStrings = useMemo(
    () => getHebrewDateStrings(activeDate),
    [activeDate]
  );

  const [activeTab, setActiveTab] = useState<'notes' | 'dates' | 'refuah'>(
    'notes'
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarMonthAnchor, setCalendarMonthAnchor] = useState<Date>(
    () => activeDate
  );

  // Sync calendarMonthAnchor whenever activeDate changes
  useEffect(() => {
    setCalendarMonthAnchor(activeDate);
  }, [activeDate]);

  // Dictionary of date-specific notes keyed by YYYY-MM-DD
  const [dateNotesMap, setDateNotesMap] = useState<
    Record<string, DateNoteRecord>
  >(() => {
    const nowKey = toDateKey(new Date());
    const fridayKey = getUpcomingFridayKey(new Date());
    const legacyScratchpad =
      localStorage.getItem('orah_daily_scratchpad') ||
      localStorage.getItem('orah_kavanot_text') ||
      '• Dedicate 20 minutes before Mincha to review today’s Halakhah Yomit.\n• Focus on Kavanah during Modim Anachnu Lach.\n• Prepare Dvar Torah insight from Chayenu for the family table.';

    try {
      const saved = localStorage.getItem(DATE_NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return {
      [nowKey]: {
        dateKey: nowKey,
        scratchpad: legacyScratchpad,
        items: [
          {
            id: 'kav-init-1',
            text: 'Recite Tehillim chapter for today after Shacharit',
            category: 'kavanah',
            completed: false,
          },
          {
            id: 'kav-init-2',
            text: 'Review daily Rambam & Chayenu portion before Maariv',
            category: 'reminder',
            completed: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      },
      [fridayKey]: {
        dateKey: fridayKey,
        scratchpad:
          '• Erev Shabbat Kavanot: Give extra Tzedakah before candle lighting.\n• Share weekly Parsha gem at the Friday night Seudah.',
        items: [
          {
            id: 'kav-fri-1',
            text: 'Complete Shnayim Mikra & prepare Shabbat table Dvar Torah',
            category: 'dvar_torah',
            completed: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    };
  });

  // Month grid for the calendar date selector
  const gridData = useMemo(
    () => buildHebrewMonthGrid(calendarMonthAnchor, activeDate),
    [calendarMonthAnchor, activeDate]
  );

  const goToPrevHebrewMonth = () => {
    const prev = new Date(
      gridData.firstDayOfHebrewMonth.getTime() - 2 * 86400000
    );
    setCalendarMonthAnchor(prev);
  };

  const goToNextHebrewMonth = () => {
    const next = new Date(
      gridData.lastDayOfHebrewMonth.getTime() + 2 * 86400000
    );
    setCalendarMonthAnchor(next);
  };

  // New reminder / kavanah item form state
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] =
    useState<DateKavanahItem['category']>('kavanah');
  const [targetDateInput, setTargetDateInput] = useState<string>(activeDateKey);

  // Sync targetDateInput when dashboard selectedDate changes
  useEffect(() => {
    setTargetDateInput(activeDateKey);
  }, [activeDateKey]);

  // Listen for external updates (e.g. "Save to Kavanot" buttons in HaYomYom / Chayenu / DailyThought)
  useEffect(() => {
    const syncExternalKavanot = () => {
      try {
        const saved = localStorage.getItem(DATE_NOTES_STORAGE_KEY);
        if (saved) {
          setDateNotesMap(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', syncExternalKavanot);
    return () => window.removeEventListener('storage', syncExternalKavanot);
  }, []);

  // Persist dateNotesMap to localStorage and keep legacy scratchpad synced for today
  useEffect(() => {
    try {
      localStorage.setItem(DATE_NOTES_STORAGE_KEY, JSON.stringify(dateNotesMap));
      const todayRec = dateNotesMap[todayKey];
      if (todayRec) {
        localStorage.setItem('orah_daily_scratchpad', todayRec.scratchpad);
        localStorage.setItem('orah_kavanot_text', todayRec.scratchpad);
      }
    } catch {
      // ignore
    }
  }, [dateNotesMap, todayKey]);

  // Refuah Sheleimah list
  const [refuahList, setRefuahList] = useState<RefuahEntry[]>(() => {
    try {
      const saved = localStorage.getItem('orah_refuah_list');
      return saved ? JSON.parse(saved) : INITIAL_REFUAH;
    } catch {
      return INITIAL_REFUAH;
    }
  });
  const [nameEn, setNameEn] = useState('');
  const [nameHe, setNameHe] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('orah_refuah_list', JSON.stringify(refuahList));
    } catch {
      // ignore
    }
  }, [refuahList]);

  const currentRecord: DateNoteRecord = useMemo(() => {
    return (
      dateNotesMap[activeDateKey] || {
        dateKey: activeDateKey,
        scratchpad: '',
        items: [],
        updatedAt: new Date().toISOString(),
      }
    );
  }, [dateNotesMap, activeDateKey]);

  const currentDayNotesCount = useMemo(() => {
    let count = 0;
    if (currentRecord.scratchpad && currentRecord.scratchpad.trim().length > 0)
      count++;
    if (currentRecord.items && currentRecord.items.length > 0)
      count += currentRecord.items.length;
    return count;
  }, [currentRecord]);

  const handleDateChange = (nextDate: Date) => {
    if (onChangeDate) {
      onChangeDate(nextDate);
    } else {
      setInternalDate(nextDate);
    }
  };

  const shiftDateByDays = (deltaDays: number) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + deltaDays);
    handleDateChange(d);
  };

  const updateCurrentScratchpad = (nextText: string) => {
    setDateNotesMap((prev) => ({
      ...prev,
      [activeDateKey]: {
        dateKey: activeDateKey,
        scratchpad: nextText,
        items: prev[activeDateKey]?.items || [],
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const copyCurrentNoteToDate = (targetYmd: string) => {
    if (!currentRecord.scratchpad && currentRecord.items.length === 0) return;
    setDateNotesMap((prev) => {
      const existing = prev[targetYmd] || {
        dateKey: targetYmd,
        scratchpad: '',
        items: [],
        updatedAt: new Date().toISOString(),
      };
      const appendedScratchpad = existing.scratchpad
        ? `${existing.scratchpad}\n\n[Copied from ${activeDateKey}]:\n${currentRecord.scratchpad}`
        : currentRecord.scratchpad;
      const copiedItems = currentRecord.items.map((it) => ({
        ...it,
        id: `kav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        completed: false,
      }));
      return {
        ...prev,
        [targetYmd]: {
          ...existing,
          scratchpad: appendedScratchpad,
          items: [...existing.items, ...copiedItems],
          updatedAt: new Date().toISOString(),
        },
      };
    });
    handleDateChange(parseDateKey(targetYmd));
  };

  const clearCurrentNote = () => {
    setDateNotesMap((prev) => {
      const copy = { ...prev };
      delete copy[activeDateKey];
      return copy;
    });
  };

  const handleAddKavanahItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const saveKey = targetDateInput || activeDateKey;
    const newItem: DateKavanahItem = {
      id: `kav-${Date.now()}`,
      text: newItemText.trim(),
      category: newItemCategory,
      completed: false,
    };

    setDateNotesMap((prev) => {
      const existing = prev[saveKey] || {
        dateKey: saveKey,
        scratchpad: '',
        items: [],
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [saveKey]: {
          ...existing,
          items: [...existing.items, newItem],
          updatedAt: new Date().toISOString(),
        },
      };
    });

    setNewItemText('');

    // If user scheduled the item for a different date, jump to that date so they see it confirmed
    if (saveKey !== activeDateKey) {
      handleDateChange(parseDateKey(saveKey));
    }
  };

  const toggleKavanahItem = (itemId: string) => {
    setDateNotesMap((prev) => {
      const existing = prev[activeDateKey];
      if (!existing) return prev;
      return {
        ...prev,
        [activeDateKey]: {
          ...existing,
          items: existing.items.map((it) =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const deleteKavanahItem = (itemId: string) => {
    setDateNotesMap((prev) => {
      const existing = prev[activeDateKey];
      if (!existing) return prev;
      return {
        ...prev,
        [activeDateKey]: {
          ...existing,
          items: existing.items.filter((it) => it.id !== itemId),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // All dates that have non-empty scratchpad or at least 1 reminder item, sorted chronologically
  const savedDateEntries = useMemo(() => {
    return (Object.values(dateNotesMap) as DateNoteRecord[])
      .filter(
        (rec) =>
          (rec.scratchpad && rec.scratchpad.trim().length > 0) ||
          (rec.items && rec.items.length > 0)
      )
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [dateNotesMap]);

  const futureSavedCount = useMemo(
    () => savedDateEntries.filter((e) => e.dateKey > todayKey).length,
    [savedDateEntries, todayKey]
  );

  const addRefuahName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameHe.trim()) return;
    setRefuahList((prev) => [
      ...prev,
      {
        id: `ref-${Date.now()}`,
        nameEn: nameEn.trim() || nameHe.trim(),
        nameHe: nameHe.trim() || nameEn.trim(),
        note: 'Refuah Sheleimah',
      },
    ]);
    setNameEn('');
    setNameHe('');
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header & Tab Switcher */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Date-Synced Sanctuary</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {hebrewDateStrings.he}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Kavanot & Date Reminders · רשימות ותזכורות
            </h2>
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Entry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dates')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                activeTab === 'dates'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <span>Dates</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                {savedDateEntries.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('refuah')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'refuah'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Names ({refuahList.length})
            </button>
          </div>
        </div>

        {/* PROMINENT CALENDAR DATE SELECTOR AT THE TOP OF NOTES WIDGET */}
        <div className="mt-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-2">
          {/* Main Date Selector Bar */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => shiftDateByDays(-1)}
                title="Previous day"
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Clickable Date Selector Trigger Button */}
              <button
                type="button"
                onClick={() => setIsCalendarOpen((v) => !v)}
                title="Open calendar date picker to view or associate notes with another date"
                className={`flex-1 min-w-0 inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors border text-left ${
                  isCalendarOpen
                    ? 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <CalendarDays className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {activeDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-amber-800 dark:text-amber-400 font-medium shrink-0">
                    · {hebrewDateStrings.he}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isToday ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Today
                    </span>
                  ) : isFuture ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Future
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      Archive
                    </span>
                  )}
                  {currentDayNotesCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                      ● {currentDayNotesCount}
                    </span>
                  ) : null}
                  {isCalendarOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => shiftDateByDays(1)}
                title="Next day"
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {!isToday && (
                <button
                  type="button"
                  onClick={() => handleDateChange(new Date())}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 hover:bg-amber-800 transition-colors shadow-xs"
                >
                  Today
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCalendarOpen((v) => !v)}
                className="px-2 py-1 text-[11px] font-medium rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-colors inline-flex items-center gap-1"
                title={isCalendarOpen ? 'Hide calendar grid' : 'Expand full month calendar selector'}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>{isCalendarOpen ? 'Close Calendar' : 'Calendar Grid'}</span>
              </button>
            </div>
          </div>

          {/* EXPANDABLE FULL HEBREW & GREGORIAN MONTH CALENDAR GRID */}
          {isCalendarOpen && (
            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5 animate-fadeIn">
              {/* Month Header & Stepper */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div>
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                    {gridData.hebrewMonthNameEn} {gridData.hebrewYearEn} · חודש{' '}
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {gridData.hebrewMonthNameHe}
                    </span>
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                    {gridData.gregorianRangeLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 rounded-lg p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={goToPrevHebrewMonth}
                    title="Previous Hebrew Month"
                    className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setCalendarMonthAnchor(today);
                      handleDateChange(today);
                    }}
                    className="px-1.5 py-0.5 text-[10px] font-medium text-stone-700 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={goToNextHebrewMonth}
                    title="Next Hebrew Month"
                    className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Weekday Columns */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                {['Su · א׳', 'Mo · ב׳', 'Tu · ג׳', 'We · ד׳', 'Th · ה׳', 'Fr · ו׳', 'Sh · ש׳'].map(
                  (d) => (
                    <div key={d} className="truncate">
                      {d}
                    </div>
                  )
                )}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {gridData.cells.map((cell) => {
                  const cellHasNotes = Boolean(
                    dateNotesMap[cell.ymd] &&
                      ((dateNotesMap[cell.ymd].scratchpad &&
                        dateNotesMap[cell.ymd].scratchpad.trim().length > 0) ||
                        (dateNotesMap[cell.ymd].items &&
                          dateNotesMap[cell.ymd].items.length > 0))
                  );
                  return (
                    <button
                      key={cell.ymd}
                      type="button"
                      onClick={() => {
                        handleDateChange(cell.date);
                      }}
                      title={`${cell.ymd} (${cell.hebrewDayGematria}) ${
                        cellHasNotes ? '• Has saved note or reminder' : ''
                      }`}
                      className={`p-1 rounded-lg flex flex-col items-center justify-center transition-all relative border min-h-[38px] ${
                        cell.isSelected
                          ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500 font-semibold shadow-xs'
                          : cell.isToday
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : cell.isCurrentHebrewMonth
                          ? 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                          : 'border-transparent opacity-35 hover:opacity-75 text-stone-500'
                      }`}
                    >
                      <span className="text-[10px] leading-tight font-medium">
                        {cell.hebrewDayGematria}
                      </span>
                      <span className="text-[9px] font-mono tabular-nums opacity-75 leading-tight">
                        {cell.gregorianDayNum}
                      </span>
                      {cellHasNotes && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                            cell.isSelected
                              ? 'bg-white dark:bg-stone-950'
                              : 'bg-amber-600 dark:bg-amber-400'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Jump Shortcuts & Direct Picker */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1.5 border-t border-stone-200/60 dark:border-stone-800 text-[10px]">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-stone-400 dark:text-stone-500 shrink-0">
                    Quick Jump:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      handleDateChange(d);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDateChange(
                        parseDateKey(getUpcomingFridayKey(new Date()))
                      )
                    }
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap"
                  >
                    Erev Shabbat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(activeDate);
                      d.setDate(d.getDate() + 7);
                      handleDateChange(d);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap font-mono"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(activeDate);
                      d.setDate(d.getDate() + 30);
                      handleDateChange(d);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap font-mono"
                  >
                    +30 Days
                  </button>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="date"
                    value={activeDateKey}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateChange(parseDateKey(e.target.value));
                      }
                    }}
                    aria-label="Direct date input"
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 text-[10px] font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: DATE-SPECIFIC NOTES & REMINDERS */}
        {activeTab === 'notes' && (
          <div className="mt-2.5 space-y-2.5">
            {/* Active Date Association Banner */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Bookmark className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                    <span>
                      Notes for{' '}
                      {activeDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-amber-800 dark:text-amber-400 font-medium">
                      · {hebrewDateStrings.he}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Specifically associated with dashboard date{' '}
                    <span className="font-mono text-stone-700 dark:text-stone-300 font-semibold">
                      {activeDateKey}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {currentRecord.scratchpad.trim() ||
                currentRecord.items.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                    <Check className="w-3 h-3" /> Auto-saved
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    Draft
                  </span>
                )}
              </div>
            </div>

            {/* Structured Kavanot / Reminders for activeDate */}
            {currentRecord.items.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Reminders for this date ({currentRecord.items.length})</span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {currentRecord.items.filter((i) => i.completed).length}/
                    {currentRecord.items.length} done
                  </span>
                </div>
                {currentRecord.items.map((item) => {
                  const meta =
                    CATEGORY_META[item.category] || CATEGORY_META.kavanah;
                  return (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-stone-50/90 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 flex items-start justify-between gap-2 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleKavanahItem(item.id)}
                        className="flex items-start gap-2 text-left flex-1 min-w-0 group"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            item.completed
                              ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                              : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-600'
                          }`}
                        >
                          {item.completed && (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block leading-snug ${
                              item.completed
                                ? 'line-through text-stone-400 dark:text-stone-500'
                                : 'text-stone-800 dark:text-stone-200 font-medium'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteKavanahItem(item.id)}
                          title="Delete reminder"
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Date-Specific Freeform Kavanot & Scratchpad */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <label htmlFor="notes-scratchpad-input" className="font-medium">
                  Daily Kavanot, Thoughts & Notes
                </label>
                <span className="text-[10px] font-mono text-stone-400">
                  {currentRecord.scratchpad.length} chars
                </span>
              </div>
              <textarea
                id="notes-scratchpad-input"
                value={currentRecord.scratchpad}
                onChange={(e) => updateCurrentScratchpad(e.target.value)}
                rows={4}
                placeholder={`Write Kavanot, Divrei Torah notes, or personal reminders specifically for ${activeDate.toLocaleDateString(
                  'en-US',
                  { weekday: 'short', month: 'short', day: 'numeric' }
                )} (${hebrewDateStrings.he})...`}
                className="w-full text-xs leading-relaxed p-2.5 rounded-lg bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-600 resize-none"
              />

              {/* Quick Note Utility Actions */}
              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(activeDate);
                      d.setDate(d.getDate() + 1);
                      copyCurrentNoteToDate(toDateKey(d));
                    }}
                    disabled={
                      !currentRecord.scratchpad &&
                      currentRecord.items.length === 0
                    }
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition-colors"
                    title="Copy note to tomorrow's date entry"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy to Tomorrow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const friKey = getUpcomingFridayKey(activeDate);
                      copyCurrentNoteToDate(friKey);
                    }}
                    disabled={
                      !currentRecord.scratchpad &&
                      currentRecord.items.length === 0
                    }
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition-colors"
                    title="Copy note to upcoming Shabbat's date entry"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy to Erev Shabbat</span>
                  </button>
                </div>
                {(currentRecord.scratchpad ||
                  currentRecord.items.length > 0) && (
                  <button
                    type="button"
                    onClick={clearCurrentNote}
                    className="text-stone-400 hover:text-rose-600 transition-colors"
                    title="Clear all notes for this date"
                  >
                    Clear date note
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED & UPCOMING DATES INDEX */}
        {activeTab === 'dates' && (
          <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-0.5">
            {savedDateEntries.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 dark:text-stone-400">
                No date-specific notes saved yet. Select any date from the
                calendar selector above to add an entry!
              </div>
            ) : (
              savedDateEntries.map((entry) => {
                const entryDate = parseDateKey(entry.dateKey);
                const heb = getHebrewDateStrings(entryDate);
                const isSelected = entry.dateKey === activeDateKey;
                const isEntryFuture = entry.dateKey > todayKey;
                const isEntryToday = entry.dateKey === todayKey;

                return (
                  <button
                    key={entry.dateKey}
                    type="button"
                    onClick={() => {
                      handleDateChange(entryDate);
                      setActiveTab('notes');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                        : 'bg-white dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800 hover:border-amber-500/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-mono">
                          {entryDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                          · {heb.he}
                        </span>
                        {isEntryToday && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                            Today
                          </span>
                        )}
                        {isEntryFuture && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                            Upcoming
                          </span>
                        )}
                      </div>
                      {entry.items.length > 0 && (
                        <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 truncate">
                          • {entry.items[0].text}
                          {entry.items.length > 1
                            ? ` (+${entry.items.length - 1} more)`
                            : ''}
                        </div>
                      )}
                      {entry.scratchpad.trim() && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                          {entry.scratchpad.replace(/\n/g, ' ')}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                      Open →
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: REFUAH SHELEIMAH TEFILLAH LIST */}
        {activeTab === 'refuah' && (
          <div className="mt-2 divide-y divide-stone-200/60 dark:divide-stone-800/80 max-h-56 overflow-y-auto">
            {refuahList.map((r) => (
              <div
                key={r.id}
                className="py-2 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                    {r.nameEn} · <span className="font-normal">{r.nameHe}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {r.note}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRefuahList((prev) =>
                      prev.filter((item) => item.id !== r.id)
                    )
                  }
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      {activeTab === 'refuah' ? (
        <form
          onSubmit={addRefuahName}
          className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5"
        >
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Name (e.g. David ben Sarah)"
            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
          <input
            type="text"
            value={nameHe}
            onChange={(e) => setNameHe(e.target.value)}
            placeholder="שם בעברית"
            dir="rtl"
            className="w-28 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg whitespace-nowrap shrink-0"
          >
            Add
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleAddKavanahItem}
          className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 space-y-1.5"
        >
          <div className="flex items-center gap-1.5">
            <select
              value={newItemCategory}
              onChange={(e) =>
                setNewItemCategory(
                  e.target.value as DateKavanahItem['category']
                )
              }
              aria-label="Entry category"
              className="text-[11px] px-2 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
            >
              <option value="kavanah">Kavanah</option>
              <option value="reminder">Reminder</option>
              <option value="dvar_torah">Dvar Torah</option>
              <option value="simcha">Yahrtzeit / Simcha</option>
            </select>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={`Add reminder specifically for ${activeDate.toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
              )}...`}
              className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <span>Target Date:</span>
              <input
                type="date"
                value={targetDateInput}
                onChange={(e) => setTargetDateInput(e.target.value)}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
              />
              {targetDateInput !== activeDateKey && (
                <span className="text-[10px] text-amber-700 dark:text-amber-400">
                  (will save to {targetDateInput})
                </span>
              )}
            </div>
            {futureSavedCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('dates')}
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                {futureSavedCount} upcoming date
                {futureSavedCount > 1 ? 's' : ''} scheduled
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

// 4. WORLD HALACHIC CLOCKS WIDGET
export const WorldClocksWidget: React.FC<{ onSelectCity: (locId: string) => void }> = ({
  onSelectCity,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const worldCities = useMemo(() => {
    const ids = ['jerusalem', 'brooklyn-ch', 'bnei-brak', 'london'];
    return ids
      .map((id) => PRESET_LOCATIONS.find((l) => l.id === id)!)
      .filter(Boolean)
      .map((loc) => {
        const z = buildZmanimFromAstronomy(now, loc, 'GRA');
        const shkiah = z.items.find((i) => i.id === 'sunset')?.formattedTime || '';
        const netz = z.items.find((i) => i.id === 'sunrise')?.formattedTime || '';
        return {
          loc,
          localTime: formatTimeInTz(now, loc.tzid),
          netz,
          shkiah,
        };
      });
  }, [now]);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Global Kehillot</span>
              <span aria-hidden="true">·</span>
              <span>Click any city to switch active horizon</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              World Halachic Clocks · שעון עולמי
            </h2>
          </div>
          <Globe className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
        </div>

        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-2">
          {worldCities.map(({ loc, localTime, netz, shkiah }) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelectCity(loc.id)}
              className="w-full py-2.5 px-2 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors flex items-center justify-between text-left"
            >
              <div>
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {loc.name} ·{' '}
                  <span className="font-normal text-stone-500 dark:text-stone-400">
                    {loc.hebrewName}
                  </span>
                </div>
                <div className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400 mt-0.5">
                  Netz {netz} · Shkiah {shkiah}
                </div>
              </div>
              <div className="text-sm font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                {localTime}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        Synchronized with astronomical horizon calculations
      </div>
    </div>
  );
};

// 5. CUSTOM USER-CREATED WIDGET
export const CustomUserWidget: React.FC<{
  widget: WidgetInstance;
  onUpdateWidget: (updated: WidgetInstance) => void;
}> = ({ widget, onUpdateWidget }) => {
  const payload = widget.customData || {
    subType: 'checklist',
    items: [
      { id: 'c1', text: 'Morning Modeh Ani & Netilat Yadayim', done: true },
      { id: 'c2', text: 'Recite Asher Yatzar with Kavanah', done: false },
    ],
  };

  const [newItemText, setNewItemText] = useState('');

  const toggleCheck = (itemId: string) => {
    const nextItems = (payload.items || []).map((it) =>
      it.id === itemId ? { ...it, done: !it.done } : it
    );
    onUpdateWidget({
      ...widget,
      customData: { ...payload, items: nextItems },
    });
  };

  const addCustomCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const nextItems = [
      ...(payload.items || []),
      { id: `item-${Date.now()}`, text: newItemText.trim(), done: false },
    ];
    onUpdateWidget({
      ...widget,
      customData: { ...payload, items: nextItems },
    });
    setNewItemText('');
  };

  // Calculate days left if countdown
  const daysRemaining = useMemo(() => {
    if (payload.subType !== 'countdown' || !payload.targetDate) return 0;
    const target = new Date(payload.targetDate + 'T00:00:00');
    const diff = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [payload]);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Custom Personal Widget · {widget.subtitle || 'User Created'}
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
            {widget.title}
          </h2>
        </div>

        {payload.subType === 'countdown' ? (
          <div className="py-6 text-center">
            <div className="text-4xl font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400">
              {daysRemaining}
            </div>
            <div className="text-xs font-medium text-stone-600 dark:text-stone-300 mt-1">
              Days Remaining until {widget.title}
            </div>
            {payload.targetDate && (
              <div className="text-[11px] font-mono tabular-nums text-stone-400 mt-1">
                Target Date: {payload.targetDate}
              </div>
            )}
          </div>
        ) : payload.subType === 'links' ? (
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-2">
            {(payload.links || []).map((lnk) => (
              <a
                key={lnk.id}
                href={lnk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 flex items-center justify-between text-xs font-medium text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <span>{lnk.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-2">
            {(payload.items || []).map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => toggleCheck(it.id)}
                className="w-full py-2 flex items-center gap-2.5 text-left text-xs"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                    it.done
                      ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {it.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span
                  className={
                    it.done
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 dark:text-stone-200 font-medium'
                  }
                >
                  {it.text}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {payload.subType === 'checklist' && (
        <form
          onSubmit={addCustomCheck}
          className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add item..."
            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg whitespace-nowrap shrink-0"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
};
