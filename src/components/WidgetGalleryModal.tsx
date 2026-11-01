import React, { useState } from 'react';
import {
  Check,
  GripVertical,
  LayoutGrid,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { WidgetInstance, WidgetSpan } from '../types/dashboard';

interface WidgetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetInstance[];
  onToggleWidget: (id: string) => void;
  onChangeSpan: (id: string, span: WidgetSpan) => void;
  onReorderWidgets: (draggedId: string, targetId: string) => void;
  onAddCustomWidget: (widget: WidgetInstance) => void;
  onDeleteCustomWidget: (id: string) => void;
  onApplyPreset: (preset: 'complete' | 'focused' | 'shabbat') => void;
}

const WIDGET_DESCRIPTIONS: Record<string, string> = {
  zmanim:
    'Interactive SVG Celestial Horizon Arc, live countdown to next Zman, and 14 Halachic times (GRA, Magen Avraham, Baal HaTanya).',
  mini_calendar:
    'Interactive Hebrew month Luach displaying Hebrew Gematria & Gregorian dates; click any date to sync Zmanim, Parsha, and Limud.',
  upcoming_holidays:
    'Countdown to the next major Jewish festival with remaining days, Hebrew & Gregorian dates, Erev sunset time, and Mitzvot summary.',
  hayom_yom:
    'Daily Chabad Chassidic almanac (לוח היום יום) compiled by the Lubavitcher Rebbe with daily Tehillim chapters, Tanya portion, and bilingual aphorism.',
  daf_yomi:
    'Dedicated Talmud Bavli Daf Yomi tracker with Amud Aleph & Amud Bet checkoffs, Masechet progress bar, Siyum countdown, and bilingual Gemara reader.',
  daily_thought:
    'Daily Mishnah (Pirkei Avot) snippet, Parsha insight, and Chassidic gem synchronized with the selected Hebrew date and weekly Parsha.',
  prayer_direction:
    'Interactive Mizrach compass pointing toward Har HaBayit in Jerusalem using browser orientation sensors, with Great Circle & Rhumb Line bearings.',
  daily_minyan:
    'Local synagogue & Beit Midrash schedule for Shacharis, Mincha, and Maariv with live countdown to the next prayer session and Zmanim sync.',
  weather:
    'Real-time local weather, 8-hour strip, 5-day forecast, and sky clarity advisory for Tzeit & Kiddush Levana.',
  parsha:
    'Weekly Torah portion, Shabbat candle lighting & Havdalah times, and interactive 7-Aliyot Shnayim Mikra tracker.',
  limud:
    'Live daily study schedules (Chitas, Daf Yomi, Rambam, Tanya, Mishnah Yomit) with built-in bilingual text reader.',
  shabbat_prep:
    'Interactive Erev Shabbat checklist (Nerot, Blech, Shnayim Mikra, garments, Tzedakah) with custom tasks.',
  tzedakah:
    'Personal Maaser Kesafim & Chomesh calculator (10% / 20%) and Tzedakah donation ledger.',
  notes:
    'Personal Kavanot scratchpad and Refuah Sheleimah / Tefillah names list with Hebrew & English names.',
  world_clocks:
    'Live local time, Netz HaChama, and Shkiah across Jerusalem, Crown Heights, Bnei Brak, and London.',
};

export const WidgetGalleryModal: React.FC<WidgetGalleryModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onChangeSpan,
  onReorderWidgets,
  onAddCustomWidget,
  onDeleteCustomWidget,
  onApplyPreset,
}) => {
  const [tab, setTab] = useState<'catalog' | 'create'>('catalog');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customSubType, setCustomSubType] = useState<'checklist' | 'countdown' | 'links'>(
    'checklist'
  );
  const [customDate, setCustomDate] = useState('2026-12-04');
  const [customItemsRaw, setCustomItemsRaw] = useState(
    'Say Modeh Ani upon waking\nStudy 15 minutes of Torah\nGive daily Tzedakah before Shacharit'
  );
  const [customSpan, setCustomSpan] = useState<WidgetSpan>(1);

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newWidget: WidgetInstance = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: customTitle.trim(),
      subtitle:
        customSubType === 'countdown'
          ? 'Countdown Timer'
          : customSubType === 'links'
          ? 'Quick Bookmarks'
          : 'Daily Mitzvah Checklist',
      span: customSpan,
      visible: true,
      customData: {
        subType: customSubType,
        targetDate: customSubType === 'countdown' ? customDate : undefined,
        items:
          customSubType === 'checklist'
            ? customItemsRaw
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((text, idx) => ({
                  id: `ci-${Date.now()}-${idx}`,
                  text,
                  done: false,
                }))
            : undefined,
        links:
          customSubType === 'links'
            ? [
                { id: 'l1', label: 'Sefaria Torah Library', url: 'https://www.sefaria.org' },
                { id: 'l2', label: 'Hebcal Luach & Zmanim', url: 'https://www.hebcal.com' },
                { id: 'l3', label: 'Chabad.org Daily Study', url: 'https://www.chabad.org' },
              ]
            : undefined,
      },
    };

    onAddCustomWidget(newWidget);
    setCustomTitle('');
    setTab('catalog');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-gallery-title"
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Personalize Your Homescreen</span>
            </div>
            <h3
              id="widget-gallery-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5"
            >
              Widget Gallery & Layout Studio
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setTab('catalog')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  tab === 'catalog'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Manage Widgets ({widgets.filter((w) => w.visible).length}/{widgets.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('create')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  tab === 'create'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                + Create Custom Widget
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close widget gallery"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'catalog' ? (
            <div className="space-y-5">
              {/* Quick Layout Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-200/80 dark:border-stone-800">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  Workspace Presets:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApplyPreset('complete')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Complete Sanctuary (All 8)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyPreset('focused')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Focused Zmanim & Study
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyPreset('shabbat')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Erev Shabbat Mode
                  </button>
                </div>
              </div>

              {/* Widget List (Drag and Drop Reorderable) */}
              <div className="divide-y divide-stone-200/70 dark:divide-stone-800">
                {widgets.map((w) => {
                  const isBeingDragged = draggedId === w.id;
                  const isDragTarget = dragOverId === w.id && draggedId !== w.id;

                  return (
                    <div
                      key={w.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(w.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', w.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedId && draggedId !== w.id) {
                          setDragOverId(w.id);
                          onReorderWidgets(draggedId, w.id);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const sourceId = draggedId || e.dataTransfer.getData('text/plain');
                        if (sourceId && sourceId !== w.id) {
                          onReorderWidgets(sourceId, w.id);
                        }
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`py-3.5 px-2 -mx-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
                        isBeingDragged
                          ? 'opacity-50 bg-amber-50/70 dark:bg-amber-950/30 ring-1 ring-amber-500/50'
                          : isDragTarget
                          ? 'bg-stone-100/80 dark:bg-stone-800/60'
                          : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/30'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className="mt-0.5 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder widget"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleWidget(w.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            w.visible
                              ? 'bg-amber-700 border-amber-700 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950'
                              : 'border-stone-300 dark:border-stone-700'
                          }`}
                          aria-label={`Toggle ${w.title}`}
                        >
                          {w.visible && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {w.title}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {WIDGET_DESCRIPTIONS[w.type] ||
                              w.subtitle ||
                              'Custom user-configured homescreen widget.'}
                          </p>
                        </div>
                      </div>

                      {/* Width Span & Delete Controls */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <div
                          className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700"
                          title="Widget Width Span (Desktop 3-Column Grid)"
                        >
                          {([1, 2, 3] as WidgetSpan[]).map((sp) => (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => onChangeSpan(w.id, sp)}
                              className={`px-2 py-0.5 text-[11px] font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                w.span === sp
                                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                                  : 'text-stone-500 dark:text-stone-400'
                              }`}
                            >
                              {sp}col
                            </button>
                          ))}
                        </div>

                        {w.type === 'custom' && (
                          <button
                            type="button"
                            onClick={() => onDeleteCustomWidget(w.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete custom widget"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Chanukah Countdown, Morning Brachot, Simcha Prep..."
                  className="w-full text-sm px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Widget Template Type
                  </label>
                  <select
                    value={customSubType}
                    onChange={(e) =>
                      setCustomSubType(
                        e.target.value as 'checklist' | 'countdown' | 'links'
                      )
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  >
                    <option value="checklist">Interactive Mitzvah / Task Checklist</option>
                    <option value="countdown">Yom Tov / Simcha Countdown</option>
                    <option value="links">Quick Torah & Shiur Bookmarks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Desktop Column Width
                  </label>
                  <select
                    value={customSpan}
                    onChange={(e) => setCustomSpan(Number(e.target.value) as WidgetSpan)}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  >
                    <option value={1}>1 Column (Compact)</option>
                    <option value={2}>2 Columns (Wide)</option>
                    <option value={3}>3 Columns (Full Row)</option>
                  </select>
                </div>
              </div>

              {customSubType === 'countdown' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              {customSubType === 'checklist' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Initial Checklist Items (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={customItemsRaw}
                    onChange={(e) => setCustomItemsRaw(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Widget to Homescreen
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>All layout customizations are saved automatically to your browser</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
