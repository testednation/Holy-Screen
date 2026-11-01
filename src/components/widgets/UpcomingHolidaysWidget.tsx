import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Flame,
  Sparkles,
} from 'lucide-react';
import { JewishHolidayEvent, LocationConfig } from '../../types/dashboard';
import { calculateUpcomingJewishHolidays } from '../../services/halachaService';

interface UpcomingHolidaysWidgetProps {
  selectedDate: Date;
  location: LocationConfig;
  onSelectDate: (date: Date) => void;
  onOpenReader: (ref: string, title: string) => void;
}

export const UpcomingHolidaysWidget: React.FC<UpcomingHolidaysWidgetProps> = ({
  selectedDate,
  location,
  onSelectDate,
  onOpenReader,
}) => {
  const [filterMode, setFilterMode] = useState<'major' | 'all'>('major');
  const [inspectedHolidayId, setInspectedHolidayId] = useState<string | null>(
    null
  );

  const allUpcoming = useMemo(
    () => calculateUpcomingJewishHolidays(selectedDate, location),
    [selectedDate, location]
  );

  const majorFestivals = useMemo(
    () => allUpcoming.filter((h) => h.isMajorFestival),
    [allUpcoming]
  );

  const nextMajorHoliday: JewishHolidayEvent | undefined =
    majorFestivals[0] || allUpcoming[0];

  const activeHoliday: JewishHolidayEvent | undefined = useMemo(() => {
    if (inspectedHolidayId) {
      const found = allUpcoming.find((h) => h.id === inspectedHolidayId);
      if (found) return found;
    }
    return nextMajorHoliday;
  }, [inspectedHolidayId, allUpcoming, nextMajorHoliday]);

  const listItems = useMemo(() => {
    const source = filterMode === 'major' ? majorFestivals : allUpcoming;
    return source.slice(0, 6);
  }, [filterMode, majorFestivals, allUpcoming]);

  if (!activeHoliday) {
    return null;
  }

  const weeksRemaining = Math.floor(activeHoliday.daysRemaining / 7);
  const extraDaysRemaining = activeHoliday.daysRemaining % 7;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Mo’adei Yisrael · Festival Countdown</span>
              <span aria-hidden="true">·</span>
              <span>{location.name}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
              Upcoming Holidays · מועדי השנה
            </h2>
          </div>

          {/* Filter Toggle: Major Festivals vs All Holidays */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700"
            role="group"
            aria-label="Holiday Filter"
          >
            <button
              type="button"
              onClick={() => {
                setFilterMode('major');
                setInspectedHolidayId(null);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'major'
                  ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Major Festivals
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              All Mo’adim
            </button>
          </div>
        </div>

        {/* Hero Countdown Banner for Next Major Festival (or Inspected Festival) */}
        <div className="my-3.5 p-4 rounded-xl bg-stone-950 text-stone-100 border border-stone-800 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeHoliday.id === nextMajorHoliday?.id
                    ? 'Next Major Festival'
                    : activeHoliday.categoryLabel}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mt-0.5 truncate">
                {activeHoliday.nameEn}
              </h3>
              <div className="text-sm font-display text-amber-300/95">
                {activeHoliday.nameHe}
              </div>
            </div>

            {/* Remaining Days Numeric Readout */}
            <div className="text-right shrink-0 pl-3 border-l border-stone-800">
              {activeHoliday.daysRemaining === 0 ? (
                <div className="text-xl font-mono tabular-nums font-bold text-amber-400">
                  Today!
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-amber-400 leading-none">
                      {activeHoliday.daysRemaining}
                    </span>
                    <span className="text-xs font-mono text-stone-300">
                      {activeHoliday.daysRemaining === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono tabular-nums text-stone-400 mt-1">
                    {weeksRemaining > 0
                      ? `${weeksRemaining}w ${extraDaysRemaining}d remaining`
                      : 'Coming up this week'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Exact Holiday Date & Erev Sunset Onset Row */}
          <div className="mt-3 pt-2.5 border-t border-stone-800/90 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-stone-400">Festival Date</div>
              <div className="font-mono tabular-nums font-semibold text-stone-100 mt-0.5">
                {activeHoliday.gregorianDateFormatted}
              </div>
              <div className="text-[11px] text-amber-300/90">
                {activeHoliday.hebrewDateLabelHe} · {activeHoliday.hebrewDateLabelEn}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] text-stone-400">
                Erev Holiday Onset (Shkiah)
              </div>
              <div className="font-mono tabular-nums font-semibold text-stone-100 mt-0.5">
                {activeHoliday.erevDateFormatted} · {activeHoliday.erevSunsetFormatted}
              </div>
              <div className="text-[11px] text-stone-400">
                {activeHoliday.durationLabel}
              </div>
            </div>
          </div>

          {/* Mitzvot & Observance Summary */}
          <p className="mt-2.5 pt-2 border-t border-stone-800/70 text-[11px] text-stone-300 leading-relaxed">
            {activeHoliday.mitzvotSummary}
          </p>
        </div>

        {/* Upcoming Festival Queue List */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1.5 px-1">
            <span>Upcoming Festival Schedule (Click to inspect)</span>
            <span className="font-mono">Countdown</span>
          </div>

          <div className="space-y-1">
            {listItems.map((holiday) => {
              const isSelected = activeHoliday.id === holiday.id;
              return (
                <button
                  key={holiday.id}
                  type="button"
                  onClick={() => setInspectedHolidayId(holiday.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors border ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/35 border-amber-300/80 dark:border-amber-800/70'
                      : 'border-transparent hover:bg-stone-100/70 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {holiday.nameEn}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
                        · {holiday.nameHe.split('·')[0].trim()}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                      {holiday.gregorianDateFormatted} · {holiday.hebrewDateLabelHe}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-400">
                      {holiday.daysRemaining === 0
                        ? 'Today'
                        : `in ${holiday.daysRemaining}d`}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                      {holiday.isMajorFestival ? 'Major' : 'Minor/Fast'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions: Jump Dashboard Date to Holiday & Open Sefaria Source */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => onSelectDate(activeHoliday.startDate)}
          className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors whitespace-nowrap"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Jump Luach to {activeHoliday.nameEn.split(' ')[0]}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onOpenReader(
              activeHoliday.sefariaRef,
              `${activeHoliday.nameEn} · ${activeHoliday.sefariaRef}`
            )
          }
          className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Holiday Source →</span>
        </button>
      </div>
    </div>
  );
};
