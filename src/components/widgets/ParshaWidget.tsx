import React, { useState, useEffect } from 'react';
import { BookOpen, Check, Flame, Sparkles } from 'lucide-react';
import { ParshaData, LocationConfig } from '../../types/dashboard';

interface ParshaWidgetProps {
  parsha: ParshaData;
  location: LocationConfig;
  onOpenReader: (ref: string, title: string) => void;
}

export const ParshaWidget: React.FC<ParshaWidgetProps> = ({
  parsha,
  location,
  onOpenReader,
}) => {
  const storageKey = `orah_shnayim_mikra_${parsha.nameEn}`;
  const [completedAliyot, setCompletedAliyot] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : ['1', '2'];
    } catch {
      return ['1', '2'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedAliyot));
    } catch {
      // ignore
    }
  }, [completedAliyot, storageKey]);

  const toggleAliyah = (num: string) => {
    setCompletedAliyot((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const progressPct = Math.round(
    (completedAliyot.length / Math.max(1, parsha.aliyot.length)) * 100
  );

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Weekly Torah Portion</span>
              <span aria-hidden="true">·</span>
              <span>{parsha.shabbatDateStr}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              {parsha.nameEn} · {parsha.nameHe}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenReader(parsha.aliyot[0]?.ref || parsha.fullRef, parsha.nameEn)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 rounded-lg hover:bg-amber-100/80 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read Chumash
          </button>
        </div>

        {/* Candle Lighting & Havdalah Strip */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Candle Lighting ({location.candleLightingMinutes}m)</span>
            </div>
            <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              {parsha.candleLighting}
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Shabbat Ends (Havdalah)</span>
            </div>
            <div className="text-lg font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
              {parsha.havdalah}
            </div>
          </div>
        </div>

        {/* Parsha Summary & Metadata */}
        <div className="py-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
            <span>Torah: {parsha.fullRef}</span>
            <span aria-hidden="true">·</span>
            <span>Haftarah: {parsha.haftarahRef}</span>
          </div>
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            {parsha.summary}
          </p>
        </div>

        {/* Shnayim Mikra & Aliyot Schedule */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
              Shnayim Mikra · 7 Aliyot Schedule
            </span>
            <span className="text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400">
              {completedAliyot.length}/{parsha.aliyot.length} Completed ({progressPct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-amber-600 dark:bg-amber-500 transition-transform duration-200 origin-left"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>

          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/70">
            {parsha.aliyot.map((aliyah) => {
              const isDone = completedAliyot.includes(aliyah.num);
              return (
                <div
                  key={aliyah.num}
                  className="py-1.5 flex items-center justify-between gap-2 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleAliyah(aliyah.num)}
                    className="flex items-center gap-2.5 text-left min-w-0 flex-1 group"
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        isDone
                          ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                          : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-600'
                      }`}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span
                      className={`font-medium truncate ${
                        isDone
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {aliyah.labelEn} · {aliyah.labelHe}
                    </span>
                  </button>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400">
                      {aliyah.ref.replace(/^Genesis|^Exodus|^Leviticus|^Numbers|^Deuteronomy/, '')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenReader(aliyah.ref, `${parsha.nameEn} — ${aliyah.labelEn}`)
                      }
                      className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap"
                    >
                      Read
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>Click any Aliyah to check off Shnayim Mikra</span>
        <button
          type="button"
          onClick={() => onOpenReader(parsha.haftarahRef, `Haftarah · ${parsha.haftarahRef}`)}
          className="text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap"
        >
          Open Haftarah →
        </button>
      </div>
    </div>
  );
};
