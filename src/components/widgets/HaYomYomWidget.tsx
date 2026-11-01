import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getHaYomYomForDate } from '../../data/hayomYomData';

interface HaYomYomWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const HaYomYomWidget: React.FC<HaYomYomWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const [savedToKavanot, setSavedToKavanot] = useState(false);

  const entry = useMemo(() => getHaYomYomForDate(selectedDate), [selectedDate]);

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
    setSavedToKavanot(false);
  };

  const handleSaveToKavanot = () => {
    try {
      const existing = localStorage.getItem('orah_kavanot_text') || '';
      const snippet = `[HaYom Yom · ${entry.hebrewDateDisplayEn}] ${entry.titleEn}: "${entry.aphorismEn}"`;
      if (!existing.includes(entry.titleEn)) {
        const updated = existing ? `${existing}\n\n${snippet}` : snippet;
        localStorage.setItem('orah_kavanot_text', updated);
      }
      setSavedToKavanot(true);
      setTimeout(() => setSavedToKavanot(false), 2500);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Top Header & Day Stepper */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>לוח היום יום · Chassidic Daily Almanac</span>
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              HaYom Yom · {entry.hebrewDateDisplayHe}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Previous Day’s HaYom Yom"
              aria-label="Previous Day’s HaYom Yom"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Next Day’s HaYom Yom"
              aria-label="Next Day’s HaYom Yom"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Chitas Shiurim Header Strip (Printed at the top of every HaYom Yom page) */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onOpenReader(
                entry.tehillimSefariaRef,
                `Daily Tehillim · ${entry.tehillimRangeEn}`
              )
            }
            className="text-left p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600/60 transition-colors group"
          >
            <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
              <span>תהילים יומי · Daily Tehillim</span>
              <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400 opacity-75 group-hover:opacity-100" />
            </div>
            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              {entry.tehillimRangeEn}
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
              {entry.tehillimRangeHe}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenReader(
                entry.tanyaSefariaRef,
                `Daily Tanya · ${entry.tanyaPortionEn}`
              )
            }
            className="text-left p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 hover:border-amber-600/60 transition-colors group"
          >
            <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
              <span>תניא יומי · Daily Tanya</span>
              <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400 opacity-75 group-hover:opacity-100" />
            </div>
            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
              {entry.tanyaPortionEn}
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium truncate">
              {entry.tanyaPortionHe}
            </div>
          </button>
        </div>

        {/* Optional Chassidic Calendar Milestone Banner */}
        {entry.chassidicMilestone && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-medium text-amber-900 dark:text-amber-300">
            {entry.chassidicMilestone}
          </div>
        )}

        {/* Bilingual HaYom Yom Aphorism Card */}
        <div className="mt-3 p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2 border-b border-stone-200/70 dark:border-stone-800 pb-2">
            <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              {entry.titleEn}
            </h3>
            <span
              dir="rtl"
              className="text-xs font-medium text-amber-800 dark:text-amber-400 shrink-0"
            >
              {entry.titleHe}
            </span>
          </div>

          {/* Vowelized Original Hebrew Teaching */}
          <p
            dir="rtl"
            className="text-sm leading-relaxed font-serif text-stone-900 dark:text-stone-100 text-right"
          >
            {entry.aphorismHe}
          </p>

          {/* English Translation */}
          <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
            {entry.aphorismEn}
          </p>

          {/* Practical Daily Avodah Takeaway */}
          <div className="pt-2 border-t border-dashed border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-amber-800 dark:text-amber-400">
              Daily Avodah:{' '}
            </span>
            <span>{entry.practicalAvodah}</span>
          </div>
        </div>
      </div>

      {/* Footer Attribution & Bookmark Action */}
      <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
        <span className="truncate">{entry.sourceNote}</span>
        <button
          type="button"
          onClick={handleSaveToKavanot}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 font-medium transition-colors shrink-0"
        >
          {savedToKavanot ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Saved to Kavanot</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span>Save to Kavanot</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
