import React, { useState, useMemo } from 'react';
import { BookOpen, BookmarkCheck, BookmarkPlus } from 'lucide-react';
import {
  getDailyThoughtsForDateAndParsha,
  DailyThoughtEntry,
} from '../../data/dailyThoughts';
import { getHebrewDateStrings } from '../../services/halachaService';

interface DailyThoughtWidgetProps {
  selectedDate: Date;
  parshaNameEn?: string;
  onOpenReader: (ref: string, title: string) => void;
}

export const DailyThoughtWidget: React.FC<DailyThoughtWidgetProps> = ({
  selectedDate,
  parshaNameEn,
  onOpenReader,
}) => {
  const [activeLens, setActiveLens] = useState<'mishnah' | 'parsha' | 'date_gem'>(
    'mishnah'
  );
  const [savedToastId, setSavedToastId] = useState<string | null>(null);

  const bundle = useMemo(
    () => getDailyThoughtsForDateAndParsha(selectedDate, parshaNameEn),
    [selectedDate, parshaNameEn]
  );

  const hebrewDates = useMemo(
    () => getHebrewDateStrings(selectedDate),
    [selectedDate]
  );

  const currentThought: DailyThoughtEntry = useMemo(() => {
    if (activeLens === 'parsha') return bundle.parshaThought;
    if (activeLens === 'date_gem') return bundle.dateGemThought;
    return bundle.mishnahThought;
  }, [activeLens, bundle]);

  const handleSaveToNotes = () => {
    try {
      const existing = localStorage.getItem('orah_daily_scratchpad') || '';
      const snippet = `\n• [${currentThought.sourceEn}] "${currentThought.quoteEn}"`;
      if (!existing.includes(currentThought.quoteEn)) {
        localStorage.setItem('orah_daily_scratchpad', (existing + snippet).trim());
      }
      setSavedToastId(currentThought.id);
      setTimeout(() => setSavedToastId(null), 2200);
    } catch {
      // ignore
    }
  };

  const isSavedRecently = savedToastId === currentThought.id;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>{currentThought.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{hebrewDates.he}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year:
                    selectedDate.getFullYear() !== new Date().getFullYear()
                      ? 'numeric'
                      : undefined,
                })}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Daily Thought · פניני היום
            </h2>
          </div>

          {/* Lens Switcher: Mishnah / Parsha / Daily Gem */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700"
            role="group"
            aria-label="Daily Thought Lens"
          >
            {(
              [
                { id: 'mishnah', label: 'Mishnah' },
                { id: 'parsha', label: 'Parsha' },
                { id: 'date_gem', label: 'Hayom' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLens(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeLens === tab.id
                    ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bilingual Quote Card */}
        <div className="my-3.5 p-4 rounded-xl bg-stone-50/90 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium text-amber-800 dark:text-amber-400">
              {currentThought.titleEn}
            </span>
            <span>{currentThought.titleHe}</span>
          </div>

          {/* Vowelized Hebrew Quote */}
          <p
            dir="rtl"
            className="text-lg sm:text-xl leading-relaxed font-display font-medium text-stone-900 dark:text-stone-100"
          >
            ”{currentThought.quoteHe}“
          </p>

          {/* English Literary Translation */}
          <p className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300 italic">
            “{currentThought.quoteEn}”
          </p>

          {/* Unboxed Source Metadata */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800/80">
            <span>{currentThought.sourceEn}</span>
            <span>{currentThought.sourceHe}</span>
          </div>
        </div>

        {/* Daily Practical Reflection / Kavanah */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
            Daily Kavanah & Takeaway
          </div>
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            {currentThought.reflection}
          </p>
        </div>
      </div>

      {/* Footer Actions: Save to Scratchpad & Open Sefaria Source */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={handleSaveToNotes}
          className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors whitespace-nowrap"
        >
          {isSavedRecently ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">
                Saved to Kavanot Notes
              </span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Save Quote to Notes</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            onOpenReader(
              currentThought.sefariaRef,
              `${currentThought.categoryLabel} · ${currentThought.sourceEn}`
            )
          }
          className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Open Full Source →
        </button>
      </div>
    </div>
  );
};
