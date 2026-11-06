import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Plus,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ShiurClassItem } from '../../types/dashboard';
import { getHebrewDateStrings } from '../../services/halachaService';
import { useLanguage } from '../LanguageControl';

interface ShiurimTrackerWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

const DEFAULT_SHIURIM: ShiurClassItem[] = [
  {
    id: 'shiur-gemara-daf',
    title: 'Talmud Bavli · Daf Yomi',
    hebrewTitle: 'דף היומי בבלי',
    category: 'gemara',
    maggidShiur: 'Daf Yomi Shiur / Audio Podcast',
    durationMinutes: 45,
    sefariaRef: 'Berakhot 2a',
    notes: 'Daily Bavli Folio',
  },
  {
    id: 'shiur-chumash-rashi',
    title: 'Daily Chumash with Rashi',
    hebrewTitle: 'חומש עם פירוש רש״י',
    category: 'chumash',
    maggidShiur: 'Daily Parsha Aliyah',
    durationMinutes: 20,
    sefariaRef: 'Genesis 23:1',
    notes: 'Shnayim Mikra V’Echad Targum',
  },
  {
    id: 'shiur-halacha-daily',
    title: 'Halacha L’Ma’aseh (Kitzur / Mishna Berurah)',
    hebrewTitle: 'הלכה למעשה · משנה ברורה',
    category: 'halacha',
    maggidShiur: 'Daily Practical Halacha',
    durationMinutes: 15,
    sefariaRef: 'Kitzur Shulchan Aruch 1',
    notes: 'Practical Morning & Daily Laws',
  },
  {
    id: 'shiur-chassidut-tanya',
    title: 'Chassidic Thought & Tanya',
    hebrewTitle: 'תורת החסידות ותניא',
    category: 'chassidut',
    maggidShiur: 'Daily Tanya Study Cycle',
    durationMinutes: 20,
    sefariaRef: 'Tanya, Likutei Amarim 1',
    notes: 'Inner Dimension of the Soul',
  },
  {
    id: 'shiur-mishnah-yomit',
    title: 'Mishnah Yomit (2 Daily Mishnayot)',
    hebrewTitle: 'משנה יומית',
    category: 'mishnah',
    maggidShiur: 'Seder Moed / Nashim',
    durationMinutes: 10,
    sefariaRef: 'Mishnah Berakhot 1:1',
    notes: 'Systematic Mishnah Seder',
  },
];

export const ShiurimTrackerWidget: React.FC<ShiurimTrackerWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const { lang, t } = useLanguage();
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const hebrewDate = useMemo(() => getHebrewDateStrings(selectedDate), [selectedDate]);

  // Master list of Shiurim classes (persisted in localStorage)
  const [classes, setClasses] = useState<ShiurClassItem[]>(() => {
    try {
      const saved = localStorage.getItem('orah_shiurim_classes_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SHIURIM;
  });

  useEffect(() => {
    try {
      localStorage.setItem('orah_shiurim_classes_v1', JSON.stringify(classes));
    } catch {
      // ignore
    }
  }, [classes]);

  // Daily completion record for the selected date
  const logStorageKey = `orah_shiurim_log_${dateKey}`;
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(logStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default to first class completed for fresh preview
    return [DEFAULT_SHIURIM[0].id];
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(logStorageKey);
      setCompletedIds(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedIds([]);
    }
  }, [logStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(logStorageKey, JSON.stringify(completedIds));
    } catch {
      // ignore
    }
  }, [completedIds, logStorageKey]);

  // Streak counter calculation across last 14 days
  const streakDays = useMemo(() => {
    let count = 0;
    const testDate = new Date();
    for (let i = 0; i < 30; i++) {
      const k = testDate.toISOString().slice(0, 10);
      try {
        const raw = localStorage.getItem(`orah_shiurim_log_${k}`);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) {
            count++;
          } else if (i > 0) {
            break;
          }
        } else if (i > 0) {
          break;
        }
      } catch {
        break;
      }
      testDate.setDate(testDate.getDate() - 1);
    }
    return Math.max(1, count);
  }, [completedIds]);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'gemara' | 'chumash' | 'halacha' | 'chassidut' | 'mishnah' | 'custom'
  >('all');

  // New Shiur inline form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<
    'gemara' | 'chumash' | 'halacha' | 'chassidut' | 'mishnah' | 'custom'
  >('gemara');
  const [newTeacher, setNewTeacher] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newRef, setNewRef] = useState('');

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateShiur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newShiur: ShiurClassItem = {
      id: `shiur-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      maggidShiur: newTeacher.trim() || 'Daily Chaburah',
      durationMinutes: Number(newDuration) || 20,
      sefariaRef: newRef.trim() || undefined,
      isCustom: true,
    };

    setClasses((prev) => [...prev, newShiur]);
    setNewTitle('');
    setNewTeacher('');
    setNewRef('');
    setIsAdding(false);
  };

  const handleDeleteShiur = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setCompletedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  const filteredClasses = useMemo(() => {
    if (activeCategory === 'all') return classes;
    return classes.filter((c) => c.category === activeCategory);
  }, [classes, activeCategory]);

  const totalMinutesLearned = useMemo(() => {
    return classes
      .filter((c) => completedIds.includes(c.id))
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }, [classes, completedIds]);

  const progressPercent = Math.round(
    (completedIds.length / Math.max(1, classes.length)) * 100
  );

  const isAllDone = classes.length > 0 && completedIds.length >= classes.length;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Header and Day Stepper */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                <GraduationCap className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                Torah Study Log
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{streakDays} Day Streak</span>
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
              Shiurim Tracker · מעקב שיעורים יומי
            </h2>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {hebrewDate.en} · {hebrewDate.he}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(new Date())}
              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Progress Card & Indicator */}
        <div className="mt-3.5 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {completedIds.length} of {classes.length} Shiurim Completed
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-500 dark:text-stone-400 font-mono">
                {totalMinutesLearned} mins logged
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              {progressPercent}%
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isAllDone
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isAllDone ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hazak U’Baruch! All daily classes and sedarim completed today!</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Check off your classes as you listen or learn in chavruta.
            </div>
          )}
        </div>

        {/* Category Filters and Add Button */}
        <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 text-[11px]">
            {[
              { id: 'all', label: 'All Classes' },
              { id: 'gemara', label: 'Gemara' },
              { id: 'chumash', label: 'Chumash' },
              { id: 'halacha', label: 'Halacha' },
              { id: 'chassidut', label: 'Chassidut' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors font-medium ${
                  activeCategory === tab.id
                    ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAdding((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-md transition-colors shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>{isAdding ? 'Cancel' : '+ Add Shiur'}</span>
          </button>
        </div>

        {/* Inline Add Shiur Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateShiur}
            className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2.5"
          >
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Add New Daily Class / Shiur
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block mb-0.5">
                  Shiur Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Evening Iyun Chaburah, Kitzur Podcast..."
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block mb-0.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                >
                  <option value="gemara">Gemara / Talmud</option>
                  <option value="chumash">Chumash / Parsha</option>
                  <option value="halacha">Halacha / Shulchan Aruch</option>
                  <option value="chassidut">Chassidut / Thought</option>
                  <option value="mishnah">Mishnah</option>
                  <option value="custom">Custom / General</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block mb-0.5">
                  Maggid Shiur / Speaker / Location
                </label>
                <input
                  type="text"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="e.g., Rabbi Stern, Shul Beis Midrash"
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block mb-0.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-stone-600 dark:text-stone-400 block mb-0.5">
                    Sefaria Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="e.g., Berakhot 2a"
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors"
              >
                Save Shiur
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Classes List */}
        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-3 max-h-[340px] overflow-y-auto pr-1">
          {filteredClasses.map((item) => {
            const isDone = completedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`py-3 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-stone-50/50 dark:bg-stone-900/30'
                    : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                }`}
              >
                {/* Checkbox & Details */}
                <button
                  type="button"
                  onClick={() => toggleComplete(item.id)}
                  className="flex items-start gap-2.5 text-left min-w-0 flex-1 group"
                  aria-label={`Mark ${item.title} as ${isDone ? 'incomplete' : 'completed'}`}
                >
                  <span
                    className={`mt-1 w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                        : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-600'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {item.category}
                      </span>
                      <h4
                        className={`text-xs font-semibold ${
                          isDone
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.hebrewTitle && (
                        <span className="text-[11px] font-serif text-stone-400 dark:text-stone-500">
                          · {item.hebrewTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {item.maggidShiur && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{item.maggidShiur}</span>
                        </span>
                      )}
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-mono shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{item.durationMinutes}m</span>
                      </span>
                    </div>

                    {item.notes && (
                      <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </button>

                {/* Actions: Study Link & Delete if Custom */}
                <div className="flex items-center gap-1 shrink-0 self-center">
                  {item.sefariaRef && (
                    <button
                      type="button"
                      onClick={() => onOpenReader(item.sefariaRef!, item.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 rounded-md transition-colors"
                      title="Open in Sefaria Reader"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Learn</span>
                    </button>
                  )}

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteShiur(item.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Remove custom class"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Summary Strip */}
      <div className="pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
        <span>Kevi’ut Ittim LaTorah · Establishing fixed daily study times</span>
        <span className="font-mono font-medium text-amber-800 dark:text-amber-300">
          {completedIds.length}/{classes.length} Logged
        </span>
      </div>
    </div>
  );
};
