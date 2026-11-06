import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ParshaData } from '../../types/dashboard';
import { getChayenuPackageForDate } from '../../data/chayenuData';
import { useLanguage } from '../LanguageControl';

interface ChayenuDailyWidgetProps {
  selectedDate: Date;
  onChangeDate: (next: Date) => void;
  parsha: ParshaData | null;
  onOpenReader: (ref: string, title: string) => void;
}

export const ChayenuDailyWidget: React.FC<ChayenuDailyWidgetProps> = ({
  selectedDate,
  onChangeDate,
  parsha,
  onOpenReader,
}) => {
  const { lang, t } = useLanguage();
  const pkg = useMemo(
    () => getChayenuPackageForDate(selectedDate, parsha),
    [selectedDate, parsha]
  );

  const storageKey = `chayenu_done_${pkg.dateStr}`;
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : ['chumash'];
    } catch {
      return ['chumash'];
    }
  });

  const [activeTab, setActiveTab] = useState<
    'all' | 'chitas' | 'rambam' | 'geulah' | 'insights'
  >('all');

  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedIds));
    } catch {
      // ignore
    }
  }, [completedIds, storageKey]);

  const toggleSection = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  const filteredSections = useMemo(() => {
    if (activeTab === 'all') return pkg.sections;
    if (activeTab === 'chitas')
      return pkg.sections.filter((s) =>
        ['chumash', 'tehillim', 'tanya', 'hayom_yom'].includes(s.id)
      );
    if (activeTab === 'rambam')
      return pkg.sections.filter((s) => s.id === 'rambam');
    if (activeTab === 'geulah')
      return pkg.sections.filter((s) => s.id === 'geulah');
    if (activeTab === 'insights')
      return pkg.sections.filter((s) =>
        ['living_times', 'halacha', 'haftarah'].includes(s.id)
      );
    return pkg.sections;
  }, [activeTab, pkg.sections]);

  const progressPct = Math.round(
    (completedIds.length / Math.max(1, pkg.sections.length)) * 100
  );

  const handleSaveLivingInsight = () => {
    try {
      const existing = localStorage.getItem('orah_kavanot_text') || '';
      const snippet = `[Chayenu Living with the Times · ${pkg.parshaNameEn}] "${pkg.livingWithTimesEssay.titleEn}": ${pkg.livingWithTimesEssay.coreIdea}`;
      if (!existing.includes(pkg.livingWithTimesEssay.titleEn)) {
        const updated = existing ? `${existing}\n\n${snippet}` : snippet;
        localStorage.setItem('orah_kavanot_text', updated);
      }
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Top Header: Chayenu Title & Date Stepper */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                <Flame className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                Chayenu · חיינו
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {pkg.hebrewDateEn}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
              Chayenu Daily Study Companion · {pkg.hebrewDateHe}
            </h2>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="font-medium text-amber-800 dark:text-amber-300">
                {pkg.parshaNameEn}
              </span>
              <span aria-hidden="true">·</span>
              <span>{pkg.aliyahLabelEn}</span>
              <span aria-hidden="true">·</span>
              <span>{pkg.dayOfWeekHebrewName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Previous Day’s Chayenu"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(new Date())}
              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Jump to Today"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Next Day’s Chayenu"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Filter Pills */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {completedIds.length}/{pkg.sections.length}
              </span>
              <span>Sections Studied</span>
            </div>
            <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              {progressPct}% Completed
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-200/80 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 text-[11px]">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'chitas', label: 'Chitas' },
              { id: 'rambam', label: 'Rambam' },
              { id: 'geulah', label: 'Geulah & Moshiach' },
              { id: 'insights', label: 'Living with Times' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors shrink-0 font-medium ${
                  activeTab === tab.id
                    ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Study Sections */}
        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredSections.map((sec) => {
            const isDone = completedIds.includes(sec.id);
            return (
              <div
                key={sec.id}
                className={`py-3 transition-colors rounded-xl px-2.5 -mx-1.5 ${
                  isDone
                    ? 'bg-stone-50/50 dark:bg-stone-900/30'
                    : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="flex items-start gap-2.5 text-left min-w-0 flex-1 group"
                    aria-label={`Mark ${sec.titleEn} as ${isDone ? 'incomplete' : 'completed'}`}
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
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {sec.badge}
                        </span>
                        <h4
                          className={`text-xs font-semibold ${
                            isDone
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {sec.titleEn}
                        </h4>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {sec.subtitleEn}
                        {sec.subtitleHe && ` · ${sec.subtitleHe}`}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2">
                        {sec.summaryEn}
                      </p>
                      {sec.practicalAvodah && (
                        <div className="mt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                          <span className="text-stone-400 dark:text-stone-500">
                            Practical takeaway:
                          </span>
                          <span>{sec.practicalAvodah}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 self-start">
                    {sec.sefariaRef && (
                      <button
                        type="button"
                        onClick={() => onOpenReader(sec.sefariaRef, sec.titleEn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 rounded-md transition-colors whitespace-nowrap"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Study</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Chayenu Living with the Times Essay Banner */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
        <div className="rounded-xl p-3 bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/40 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Oneness in the Parsha · {pkg.livingWithTimesEssay.titleEn}</span>
              </div>
              <button
                type="button"
                onClick={handleSaveLivingInsight}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-amber-800 dark:text-amber-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 transition-colors"
                title="Save snippet to personal Kavanot notepad"
              >
                <Bookmark className="w-3 h-3" />
                <span>{savedNote ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 line-clamp-2">
              {pkg.livingWithTimesEssay.coreIdea}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-amber-200/50 dark:border-amber-900/30">
            <span>Weekly Chassidic Insight from chayenu.org</span>
            <button
              type="button"
              onClick={() =>
                onOpenReader(
                  pkg.livingWithTimesEssay.sefariaRef,
                  `Living with the Times · ${pkg.parshaNameEn}`
                )
              }
              className="text-amber-800 dark:text-amber-300 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Read Parsha Verses</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
