import React, { useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { LimudItem } from '../../types/dashboard';

interface LimudWidgetProps {
  limud: LimudItem[];
  dateStr: string;
  onOpenReader: (ref: string, title: string) => void;
}

export const LimudWidget: React.FC<LimudWidgetProps> = ({
  limud,
  dateStr,
  onOpenReader,
}) => {
  const storageKey = `orah_limud_done_${dateStr}`;
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : ['chumash'];
    } catch {
      return ['chumash'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedIds));
    } catch {
      // ignore
    }
  }, [completedIds, storageKey]);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Keviut Ittim LaTorah</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedIds.length}/{limud.length} Completed
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Daily Limud & Shiurim · לימוד יומי
            </h2>
          </div>
        </div>

        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 mt-2">
          {limud.map((item) => {
            const isDone = completedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex items-start gap-2.5 text-left min-w-0 flex-1 group"
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                        : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-600'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`font-semibold truncate ${
                          isDone
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {item.titleEn}
                      </span>
                      <span className="text-stone-400 dark:text-stone-500 shrink-0">
                        · {item.titleHe}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 truncate">
                      {item.displayValueEn}
                      {item.displayValueHe ? ` · ${item.displayValueHe}` : ''}
                    </div>
                  </div>
                </button>

                {item.ref && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenReader(item.ref, `${item.titleEn} — ${item.displayValueEn}`)
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3 h-3" />
                    Study
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        Powered by live Sefaria calendar schedules · Check off portions as you learn
      </div>
    </div>
  );
};
