import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { calculateDafYomiForDate } from '../../services/halachaService';

interface DafYomiWidgetProps {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const DafYomiWidget: React.FC<DafYomiWidgetProps> = ({
  selectedDate,
  onChangeDate,
  onOpenReader,
}) => {
  const daf = useMemo(() => calculateDafYomiForDate(selectedDate), [selectedDate]);

  const storageKey = `orah_daf_yomi_${daf.masechetEn}_${daf.dafNum}`;
  const [amudimDone, setAmudimDone] = useState<{ a: boolean; b: boolean }>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { a: false, b: false };
    } catch {
      return { a: false, b: false };
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setAmudimDone(saved ? JSON.parse(saved) : { a: false, b: false });
    } catch {
      setAmudimDone({ a: false, b: false });
    }
  }, [storageKey]);

  const toggleAmud = (side: 'a' | 'b') => {
    setAmudimDone((prev) => {
      const next = { ...prev, [side]: !prev[side] };
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

  const bothCompleted = amudimDone.a && amudimDone.b;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>{daf.sederEn}</span>
              <span aria-hidden="true">·</span>
              <span>{daf.sederHe}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">14th Cycle</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Daf Yomi · דף היומי בבלי
            </h2>
          </div>

          {/* Daf Day Stepper */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              title="Previous Day's Daf"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(new Date())}
              className="px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              title="Next Day's Daf"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Daf Display Card */}
        <div className="my-3.5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Masechet {daf.masechetEn} · מסכת {daf.masechetHe}
            </div>
            <div className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 mt-0.5 flex items-baseline gap-2.5">
              <span>Daf {daf.dafNum}</span>
              <span className="text-amber-700 dark:text-amber-400">
                דף {daf.dafHe}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenReader(
                daf.refAmudA,
                `Talmud Bavli · ${daf.masechetEn} ${daf.dafNum}a`
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open Gemara
          </button>
        </div>

        {/* Interactive Amud Aleph & Amud Bet Tracker */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {(
            [
              {
                side: 'a' as const,
                labelEn: `Amud Aleph (${daf.dafNum}a)`,
                labelHe: 'עמוד א׳',
                ref: daf.refAmudA,
              },
              {
                side: 'b' as const,
                labelEn: `Amud Bet (${daf.dafNum}b)`,
                labelHe: 'עמוד ב׳',
                ref: daf.refAmudB,
              },
            ]
          ).map((amud) => {
            const isDone = amudimDone[amud.side];
            return (
              <div
                key={amud.side}
                className={`p-2.5 rounded-lg border transition-colors flex flex-col justify-between gap-2 ${
                  isDone
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
                    : 'bg-white dark:bg-stone-900/50 border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAmud(amud.side)}
                  className="flex items-center justify-between gap-2 text-left w-full"
                >
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {amud.labelHe}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
                      {amud.labelEn}
                    </div>
                  </div>
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isDone
                        ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenReader(amud.ref, `Talmud Bavli · ${amud.ref}`)
                  }
                  className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline text-left"
                >
                  Read {amud.side === 'a' ? 'Amud A' : 'Amud B'} →
                </button>
              </div>
            );
          })}
        </div>

        {/* Masechet Progress & Siyum Countdown */}
        <div className="space-y-3 pt-2 border-t border-stone-200/70 dark:border-stone-800">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-stone-700 dark:text-stone-300">
                Masechet {daf.masechetEn} Progress
              </span>
              <span className="font-mono tabular-nums text-stone-500 dark:text-stone-400">
                {daf.masechetProgressDia}/{daf.masechetTotalDappim} Dappim ({daf.masechetProgressPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 dark:bg-amber-500 transition-transform duration-200 origin-left"
                style={{ transform: `scaleX(${daf.masechetProgressPct / 100})` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Siyum Masechet {daf.masechetEn}:</span>
            </span>
            <span className="font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
              {daf.daysUntilSiyumMasechet === 0
                ? 'Today! Mazal Tov!'
                : `in ${daf.daysUntilSiyumMasechet} days`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: 14th Cycle Overall Telemetry */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span className="font-mono tabular-nums">
          Cycle 14: Day {daf.cycleDayIndex.toLocaleString()}/{daf.cycleTotalDays.toLocaleString()} ({daf.cycleProgressPct}%)
        </span>
        <span className="font-medium text-amber-700 dark:text-amber-400">
          {bothCompleted ? 'Daf Completed ✓' : 'Check off Amudim above'}
        </span>
      </div>
    </div>
  );
};
