import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  buildHebrewMonthGrid,
  getHebrewDateStrings,
} from '../../services/halachaService';

interface MiniCalendarWidgetProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = [
  { en: 'Sun', he: 'א׳' },
  { en: 'Mon', he: 'ב׳' },
  { en: 'Tue', he: 'ג׳' },
  { en: 'Wed', he: 'ד׳' },
  { en: 'Thu', he: 'ה׳' },
  { en: 'Fri', he: 'ו׳' },
  { en: 'Shab', he: 'ש׳' },
];

export const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Anchor date for which Hebrew month is currently displayed in the grid
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => selectedDate);

  // Sync monthAnchor when selectedDate changes externally (e.g., from Zmanim stepper)
  useEffect(() => {
    setMonthAnchor(selectedDate);
  }, [selectedDate]);

  const gridData = useMemo(
    () => buildHebrewMonthGrid(monthAnchor, selectedDate),
    [monthAnchor, selectedDate]
  );

  const goToPrevHebrewMonth = () => {
    // 2 days before the 1st of the currently displayed Hebrew month lands cleanly in the previous Hebrew month
    const prev = new Date(gridData.firstDayOfHebrewMonth.getTime() - 2 * 86400000);
    setMonthAnchor(prev);
  };

  const goToNextHebrewMonth = () => {
    // 2 days after the last day of the currently displayed Hebrew month lands cleanly in the next Hebrew month
    const next = new Date(gridData.lastDayOfHebrewMonth.getTime() + 2 * 86400000);
    setMonthAnchor(next);
  };

  const handleJumpToday = () => {
    const today = new Date();
    setMonthAnchor(today);
    onSelectDate(today);
  };

  const isSelectedToday = useMemo(() => {
    return selectedDate.toDateString() === new Date().toDateString();
  }, [selectedDate]);

  const selectedHebrewStrings = useMemo(
    () => getHebrewDateStrings(selectedDate),
    [selectedDate]
  );

  const selectedCellMeta = useMemo(
    () => gridData.cells.find((c) => c.isSelected),
    [gridData.cells]
  );

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Hebrew Month Luach</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{gridData.gregorianRangeLabel}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              {gridData.hebrewMonthNameEn} {gridData.hebrewYearEn} · חודש{' '}
              {gridData.hebrewMonthNameHe}
            </h2>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={goToPrevHebrewMonth}
              title="Previous Hebrew Month"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToNextHebrewMonth}
              title="Next Hebrew Month"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7-Column Weekday Header */}
        <div className="grid grid-cols-7 gap-1 pt-3 pb-1.5 text-center border-b border-stone-200/60 dark:border-stone-800/80">
          {WEEKDAYS.map((wd, idx) => (
            <div
              key={wd.en}
              className={`text-[11px] font-medium ${
                idx === 6
                  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <span>{wd.en}</span>
              <span className="hidden sm:inline text-stone-400 dark:text-stone-500 ml-0.5">
                · {wd.he}
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Hebrew Month Calendar Grid */}
        <div
          className="grid grid-cols-7 gap-1 pt-2"
          role="grid"
          aria-label={`Hebrew calendar for ${gridData.hebrewMonthNameEn} ${gridData.hebrewYearEn}`}
        >
          {gridData.cells.map((cell) => {
            const showMonthPrefix = cell.gregorianDayNum === 1;
            return (
              <button
                key={cell.ymd}
                type="button"
                onClick={() => onSelectDate(cell.date)}
                title={`${cell.hebrewDayGematria} ${gridData.hebrewMonthNameHe} (${cell.date.toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  }
                )})${cell.specialLabel ? ` · ${cell.specialLabel}` : ''}`}
                className={`relative py-1.5 px-1 rounded-lg flex flex-col items-center justify-center transition-colors border text-center select-none ${
                  cell.isSelected
                    ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500 shadow-xs'
                    : cell.isToday
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 border-amber-500/80'
                    : !cell.isCurrentHebrewMonth
                    ? 'opacity-35 border-transparent text-stone-400 dark:text-stone-600 hover:opacity-75 hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
                    : cell.isShabbat
                    ? 'bg-stone-100/80 dark:bg-stone-800/50 border-stone-200/60 dark:border-stone-800 text-stone-900 dark:text-stone-100 hover:border-amber-600/50'
                    : 'border-transparent text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                {/* Hebrew Gematria Day */}
                <span
                  className={`text-xs font-semibold leading-tight ${
                    cell.isSelected
                      ? 'text-white dark:text-stone-950'
                      : cell.specialLabel
                      ? 'text-amber-700 dark:text-amber-400'
                      : ''
                  }`}
                >
                  {cell.hebrewDayGematria}
                </span>

                {/* Gregorian Day Numeral */}
                <span
                  className={`text-[10px] font-mono tabular-nums leading-tight mt-0.5 ${
                    cell.isSelected
                      ? 'text-amber-100 dark:text-stone-800'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {showMonthPrefix
                    ? `${cell.gregorianMonthShort} 1`
                    : cell.gregorianDayNum}
                </span>

                {/* Subtle Underline Marker for Rosh Chodesh / Yom Tov */}
                {cell.specialLabel && !cell.isSelected && (
                  <span
                    className="w-3 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 mt-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Sync Footer */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="truncate">
            <strong className="font-medium text-stone-800 dark:text-stone-200">
              {selectedHebrewStrings.he}
            </strong>{' '}
            ·{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
            {selectedCellMeta?.specialLabel
              ? ` · ${selectedCellMeta.specialLabel}`
              : ''}
          </span>
        </div>

        {!isSelectedToday ? (
          <button
            type="button"
            onClick={handleJumpToday}
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Today
          </button>
        ) : (
          <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
            Syncs Zmanim, Parsha & Limud
          </span>
        )}
      </div>
    </div>
  );
};
