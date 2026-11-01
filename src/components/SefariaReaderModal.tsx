import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';
import { fetchSefariaText, SefariaTextPassage } from '../services/halachaService';

interface SefariaReaderModalProps {
  refString: string | null;
  title: string;
  onClose: () => void;
}

export const SefariaReaderModal: React.FC<SefariaReaderModalProps> = ({
  refString,
  title,
  onClose,
}) => {
  const [passage, setPassage] = useState<SefariaTextPassage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [langMode, setLangMode] = useState<'bilingual' | 'he' | 'en'>('bilingual');

  useEffect(() => {
    if (!refString) return;
    let active = true;
    setLoading(true);
    fetchSefariaText(refString)
      .then((res) => {
        if (active) {
          setPassage(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refString]);

  if (!refString) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Bilingual Torah Study Reader</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{refString}</span>
            </div>
            <h3
              id="reader-modal-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5"
            >
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
              {(
                [
                  { id: 'bilingual', label: 'Bilingual' },
                  { id: 'he', label: 'עברית' },
                  { id: 'en', label: 'English' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLangMode(m.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    langMode === m.id
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-lg bg-stone-100 dark:bg-stone-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : passage && passage.verses.length > 0 ? (
            passage.verses.map((v) => (
              <div
                key={v.num}
                className="pb-4 border-b border-stone-200/60 dark:border-stone-800/70 last:border-b-0"
              >
                <div className="text-[11px] font-mono tabular-nums text-amber-700 dark:text-amber-400 mb-1.5">
                  Verse {v.num}
                </div>
                {(langMode === 'bilingual' || langMode === 'he') && v.he && (
                  <p
                    dir="rtl"
                    className="text-lg leading-relaxed font-display text-stone-900 dark:text-stone-100 mb-2"
                  >
                    {v.he}
                  </p>
                )}
                {(langMode === 'bilingual' || langMode === 'en') && v.en && (
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {v.en}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">
              Unable to load text preview for {refString}.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Source text provided via Sefaria Library API</span>
          <a
            href={`https://www.sefaria.org/${encodeURIComponent(refString)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            Open Full Commentary on Sefaria
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
