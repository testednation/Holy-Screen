import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Heart,
  Sparkles,
} from 'lucide-react';
import { getGeulahMoshiachForDate } from '../../data/chayenuData';
import { useLanguage } from '../LanguageControl';

interface GeulahMoshiachWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const GeulahMoshiachWidget: React.FC<GeulahMoshiachWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const { lang, t } = useLanguage();
  const [savedToKavanot, setSavedToKavanot] = useState(false);
  const entry = useMemo(
    () => getGeulahMoshiachForDate(selectedDate),
    [selectedDate]
  );

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
    setSavedToKavanot(false);
  };

  const handleSaveToKavanot = () => {
    try {
      const existing = localStorage.getItem('orah_kavanot_text') || '';
      const snippet = `[Geulah & Moshiach · ${entry.hebrewDateDisplayEn}] ${entry.themeTitleEn}: "${entry.dailyMeditation}"`;
      if (!existing.includes(entry.themeTitleEn)) {
        const updated = existing ? `${existing}\n\n${snippet}` : snippet;
        localStorage.setItem('orah_kavanot_text', updated);
      }
      setSavedToKavanot(true);
      setTimeout(() => setSavedToKavanot(false), 2400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                <Crown className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                Chayenu Daily Curriculum
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {entry.hebrewDateDisplayEn}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
              Geulah & Moshiach · ענייני גאולה ומשיח
            </h2>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {entry.themeTitleEn}
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
              onClick={() => shiftDay(1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body: Prophecy & Halachah Cards */}
        <div className="mt-3 space-y-3">
          {/* Prophetic Passage Card */}
          <div className="rounded-xl p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
            <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-semibold mb-1">
              <span>Prophetic Vision · {entry.propheticSourceEn}</span>
              <span className="font-serif">{entry.propheticSourceHe}</span>
            </div>
            <p
              dir="rtl"
              className="font-serif text-sm text-stone-900 dark:text-stone-100 leading-relaxed text-right py-1"
            >
              {entry.propheticQuoteHe}
            </p>
            <p className="text-xs text-stone-700 dark:text-stone-300 italic mt-1 leading-relaxed">
              "{entry.propheticQuoteEn}"
            </p>
          </div>

          {/* Rambam Codification Card */}
          <div className="rounded-xl p-3 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">
              <span>Halachic Code · {entry.rambamSourceEn}</span>
              <span className="font-serif">{entry.rambamSourceHe}</span>
            </div>
            <p
              dir="rtl"
              className="font-serif text-xs text-stone-800 dark:text-stone-200 leading-relaxed text-right py-1"
            >
              {entry.rambamHalachaHe}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
              {entry.rambamHalachaEn}
            </p>
          </div>

          {/* Sichot Insight & Meditation */}
          <div className="space-y-1.5 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Chassidic Illumination & Inner Meaning</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {entry.sichotDvarTorah}
            </p>
            <div className="p-2 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Heart className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Action Meditation: </span>
                <span>{entry.dailyMeditation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSaveToKavanot}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
        >
          <Bookmark className="w-3 h-3 text-amber-700 dark:text-amber-400" />
          <span>{savedToKavanot ? 'Saved to Kavanot' : 'Save Meditation'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onOpenReader(
                entry.rambamSefariaRef,
                `Rambam · Hilchot Melachim Ch. 11-12`
              )
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>Read Hilchot Melachim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
