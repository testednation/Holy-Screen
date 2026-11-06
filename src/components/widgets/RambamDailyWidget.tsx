import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Scroll,
  ShieldCheck,
} from 'lucide-react';
import { RambamCycleTrack } from '../../types/dashboard';
import { getRambamDailyForDate } from '../../data/chayenuData';
import { useLanguage } from '../LanguageControl';

interface RambamDailyWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const RambamDailyWidget: React.FC<RambamDailyWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const { lang, t } = useLanguage();
  const [track, setTrack] = useState<RambamCycleTrack>(() => {
    try {
      const saved = localStorage.getItem('orah_rambam_preferred_track');
      if (
        saved === 'three_chapters' ||
        saved === 'one_chapter' ||
        saved === 'sefer_hamitzvot'
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'three_chapters';
  });

  const handleSelectTrack = (next: RambamCycleTrack) => {
    setTrack(next);
    try {
      localStorage.setItem('orah_rambam_preferred_track', next);
    } catch {
      // ignore
    }
  };

  const rambamData = useMemo(
    () => getRambamDailyForDate(selectedDate, track),
    [selectedDate, track]
  );

  const dateKey = selectedDate.toISOString().slice(0, 10);
  const storageKey = `rambam_done_${dateKey}_${track}`;
  const [isDone, setIsDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(isDone));
    } catch {
      // ignore
    }
  }, [isDone, storageKey]);

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Header with Title and Day Navigation */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                <Scroll className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                Chayenu Track
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {rambamData.hebrewDateEn}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
              Rambam Daily Study · רמב״ם יומי
            </h2>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Mishneh Torah & Sefer HaMitzvot Cycles
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

        {/* 3-Track Selector Buttons */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700">
          <button
            type="button"
            onClick={() => handleSelectTrack('three_chapters')}
            className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              track === 'three_chapters'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            3 Chapters
          </button>
          <button
            type="button"
            onClick={() => handleSelectTrack('one_chapter')}
            className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              track === 'one_chapter'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            1 Chapter
          </button>
          <button
            type="button"
            onClick={() => handleSelectTrack('sefer_hamitzvot')}
            className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              track === 'sefer_hamitzvot'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Sefer HaMitzvot
          </button>
        </div>

        {/* Track Content Body */}
        <div className="mt-3">
          {track === 'three_chapters' && (
            <div className="rounded-xl p-3.5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold uppercase">
                    3 Chapters-a-Day · Cycle 44
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {rambamData.threeChaptersTitleEn}
                  </h3>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {rambamData.threeChaptersTitleHe}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDone((prev) => !prev)}
                  className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    isDone
                      ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-600'
                  }`}
                  title={isDone ? 'Marked as learned' : 'Mark as learned'}
                  aria-label="Toggle learned"
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {rambamData.threeChaptersSummary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800">
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Ref: {rambamData.threeChaptersRef}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onOpenReader(
                      rambamData.threeChaptersRef,
                      rambamData.threeChaptersTitleEn
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open in Sefaria</span>
                </button>
              </div>
            </div>
          )}

          {track === 'one_chapter' && (
            <div className="rounded-xl p-3.5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold uppercase">
                    1 Chapter-a-Day Track
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {rambamData.oneChapterTitleEn}
                  </h3>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {rambamData.oneChapterTitleHe}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDone((prev) => !prev)}
                  className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    isDone
                      ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-600'
                  }`}
                  title={isDone ? 'Marked as learned' : 'Mark as learned'}
                  aria-label="Toggle learned"
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {rambamData.oneChapterSummary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800">
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Ref: {rambamData.oneChapterRef}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onOpenReader(
                      rambamData.oneChapterRef,
                      rambamData.oneChapterTitleEn
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open in Sefaria</span>
                </button>
              </div>
            </div>
          )}

          {track === 'sefer_hamitzvot' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 px-1">
                <span>
                  Today’s Commandment Count: {rambamData.seferHamitzvotItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDone((prev) => !prev)}
                  className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{isDone ? 'Learned Today' : 'Mark Learned'}</span>
                </button>
              </div>

              <div className="divide-y divide-stone-200/70 dark:divide-stone-800 max-h-[220px] overflow-y-auto pr-1">
                {rambamData.seferHamitzvotItems.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              item.type === 'aseh'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {item.type === 'aseh' ? 'Mitzvat Aseh' : 'Lo Ta’aseh'} #{item.mitzvahNum}
                          </span>
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {item.labelEn}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.labelHe}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                          {item.summary}
                        </p>
                        <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                          Source: {item.biblicalSource}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenReader(item.sefariaRef, item.labelEn)}
                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shrink-0 self-start mt-0.5"
                        title="Read in Sefaria"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
        <span>Curriculum established by the Lubavitcher Rebbe</span>
        <button
          type="button"
          onClick={() =>
            onOpenReader(
              track === 'three_chapters'
                ? rambamData.threeChaptersRef
                : track === 'one_chapter'
                ? rambamData.oneChapterRef
                : rambamData.seferHamitzvotRef,
              'Rambam Mishneh Torah'
            )
          }
          className="text-amber-800 dark:text-amber-300 font-medium hover:underline"
        >
          View Full Hebrew/English Text →
        </button>
      </div>
    </div>
  );
};
