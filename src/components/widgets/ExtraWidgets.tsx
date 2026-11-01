import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ExternalLink,
  Globe,
  Heart,
  Plus,
  RotateCcw,
  Trash2,
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

// 3. KAVANOT, NOTES & REFUAH SHELEIMAH TEFILLAH LIST WIDGET
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

export const NotesWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'refuah'>('notes');
  const [scratchpad, setScratchpad] = useState<string>(() => {
    return (
      localStorage.getItem('orah_daily_scratchpad') ||
      '• Dedicate 20 minutes before Mincha to review today’s Halakhah Yomit.\n• Call parents before Erev Shabbat.\n• Prepare Dvar Torah on Parashat Hashavua for the Shabbat table.'
    );
  });
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
    localStorage.setItem('orah_daily_scratchpad', scratchpad);
  }, [scratchpad]);

  useEffect(() => {
    localStorage.setItem('orah_refuah_list', JSON.stringify(refuahList));
  }, [refuahList]);

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
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Personal Sanctuary</span>
              <span aria-hidden="true">·</span>
              <span>Auto-saved</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Kavanot & Tefillah Names · רשימות
            </h2>
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('refuah')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'refuah'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Names ({refuahList.length})
            </button>
          </div>
        </div>

        {activeTab === 'notes' ? (
          <div className="mt-3">
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              rows={6}
              placeholder="Write daily Kavanot, Divrei Torah notes, or personal reminders..."
              className="w-full text-xs leading-relaxed p-3 rounded-lg bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-600 resize-none"
            />
          </div>
        ) : (
          <div className="mt-2 divide-y divide-stone-200/60 dark:divide-stone-800/80">
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
                    setRefuahList((prev) => prev.filter((item) => item.id !== r.id))
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
        <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
          Switch to “Names” to keep a personal Refuah Sheleimah list for Tefillah.
        </div>
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
