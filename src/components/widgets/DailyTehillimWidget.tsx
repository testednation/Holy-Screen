import React, { useMemo, useState, useEffect } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';
import { getDailyTehillimForDate } from '../../data/tehillimData';

interface DailyTehillimWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const DailyTehillimWidget: React.FC<DailyTehillimWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const data = useMemo(
    () => getDailyTehillimForDate(selectedDate),
    [selectedDate]
  );

  const storageKey = useMemo(() => {
    const ymd = selectedDate.toISOString().slice(0, 10);
    return `orah_tehillim_done_${ymd}`;
  }, [selectedDate]);

  const [completedRefs, setCompletedRefs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedRefs(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setCompletedRefs([]);
  }, [storageKey]);

  const toggleChapterComplete = (ref: string) => {
    setCompletedRefs((prev) => {
      const next = prev.includes(ref)
        ? prev.filter((r) => r !== ref)
        : [...prev, ref];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  const completedCount = data.chapters.filter((ch) =>
    completedRefs.includes(ch.sefariaRef)
  ).length;
  const totalCount = data.chapters.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        {/* Header with Hebrew Date & Day Stepper */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>תהילים יומי · Monthly Tehillim Cycle</span>
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              Daily Tehillim · Day {data.hebrewDayNum} ({data.hebrewDayGematria}{' '}
              {data.hebrewMonthHe})
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Previous Day’s Tehillim"
              aria-label="Previous Day’s Tehillim"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Next Day’s Tehillim"
              aria-label="Next Day’s Tehillim"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Range Banner & Primary Sefaria Reader Action */}
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
              {data.seferTitleEn} · {data.seferTitleHe}
            </div>
            <div className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {data.rangeLabelEn} ·{' '}
              <span className="text-amber-800 dark:text-amber-400">
                {data.rangeLabelHe}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
              {data.themeSummary}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenReader(
                data.primarySefariaRef,
                `Daily Tehillim · ${data.rangeLabelEn} (${data.hebrewDateDisplayHe})`
              )
            }
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open in Sefaria Reader</span>
          </button>
        </div>

        {/* Featured Daily Pasuk (Bilingual Hebrew & English) */}
        <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-amber-800 dark:text-amber-400">
              Featured Verse · {data.featuredPasukRef}
            </span>
            <button
              type="button"
              onClick={() =>
                onOpenReader(
                  data.featuredPasukRef,
                  `Tehillim · ${data.featuredPasukRef}`
                )
              }
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium"
            >
              <span>Read Chapter</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
          <p
            dir="rtl"
            className="text-sm font-serif leading-relaxed text-stone-900 dark:text-stone-100 text-right"
          >
            {data.featuredPasukHe}
          </p>
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 italic">
            &ldquo;{data.featuredPasukEn}&rdquo;
          </p>
        </div>

        {/* Individual Chapters Grid (Click to Read in Sefaria or Check Off) */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
            <span>
              Today&rsquo;s Chapters ({completedCount}/{totalCount} recited)
            </span>
            <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400 font-semibold">
              {progressPct}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden mb-2.5">
            <div
              className="h-full bg-amber-600 dark:bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
            {data.chapters.map((ch) => {
              const isDone = completedRefs.includes(ch.sefariaRef);
              return (
                <div
                  key={ch.sefariaRef}
                  className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg border text-xs transition-colors ${
                    isDone
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-300'
                      : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-500/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleChapterComplete(ch.sefariaRef)}
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 dark:border-stone-700 hover:border-amber-600'
                    }`}
                    title={`Mark ${ch.labelEn} recited`}
                    aria-label={`Mark ${ch.labelEn} recited`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenReader(
                        ch.sefariaRef,
                        `Tehillim · ${ch.labelEn} (${ch.labelHe})`
                      )
                    }
                    className="flex-1 text-left truncate hover:text-amber-700 dark:hover:text-amber-400"
                    title={`Open ${ch.labelEn} in Sefaria Reader`}
                  >
                    <span className="font-semibold">{ch.labelHe}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 ml-1 font-mono">
                      ({ch.chapterNum})
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with Direct External Sefaria Link & Monthly Progress */}
      <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
        <span>
          {data.hebrewDateDisplayHe} · Day {data.hebrewDayNum}/30
        </span>
        <a
          href={`https://www.sefaria.org/${encodeURIComponent(
            data.primarySefariaRef.replace(/\s+/g, '.')
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium"
        >
          <span>Sefaria.org</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
