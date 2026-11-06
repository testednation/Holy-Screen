import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Clipboard,
  Compass,
  Download,
  FileJson,
  Layers,
  MapPin,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  LocationConfig,
  ShitaOpinion,
  WidgetInstance,
  AppLanguage,
} from '../types/dashboard';
import { useLanguage } from './LanguageControl';

export interface OrahExportPackage {
  app: string;
  version: number;
  exportedAt: string;
  widgets: WidgetInstance[];
  preferences: {
    theme: 'dark' | 'light';
    language: AppLanguage;
    shita: ShitaOpinion;
    location: LocationConfig;
    candleLightingMinutes?: number;
    kavanotText?: string;
    proximityAlerts?: any;
  };
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetInstance[];
  location: LocationConfig;
  shita: ShitaOpinion;
  darkMode: boolean;
  onApplyImport: (importedPackage: OrahExportPackage) => void;
  onResetDefaults: () => void;
  onChangeShita: (shita: ShitaOpinion) => void;
  onChangeLocation: (location: LocationConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  widgets,
  location,
  shita,
  darkMode,
  onApplyImport,
  onResetDefaults,
  onChangeShita,
  onChangeLocation,
}) => {
  const { lang, setLang, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'backup' | 'preferences'>('backup');
  const [copiedJson, setCopiedJson] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [parsedPackage, setParsedPackage] = useState<OrahExportPackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  // Build current export package
  const generateExportPackage = (): OrahExportPackage => {
    let kavanotText = '';
    let proximityAlerts: any = null;
    try {
      kavanotText = localStorage.getItem('orah_kavanot_text') || '';
      const prox = localStorage.getItem('orah_proximity_alerts_v1');
      if (prox) proximityAlerts = JSON.parse(prox);
    } catch {
      // ignore
    }

    return {
      app: 'Orah Personal Luach & Study Sanctuary',
      version: 1,
      exportedAt: new Date().toISOString(),
      widgets,
      preferences: {
        theme: darkMode ? 'dark' : 'light',
        language: lang,
        shita,
        location,
        candleLightingMinutes: location.candleLightingMinutes,
        kavanotText: kavanotText || undefined,
        proximityAlerts: proximityAlerts || undefined,
      },
    };
  };

  const currentPackage = generateExportPackage();
  const jsonString = JSON.stringify(currentPackage, null, 2);

  // Trigger JSON file download
  const handleDownloadJson = () => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const fileName = `orah-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportSuccessMessage('Configuration downloaded successfully!');
      setTimeout(() => setImportSuccessMessage(null), 3000);
    } catch {
      setImportError('Failed to trigger browser download.');
    }
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      setImportError('Clipboard write permission denied.');
    }
  };

  // Validate and parse an incoming JSON object
  const validateAndStagePackage = (rawJson: string) => {
    setImportError(null);
    setImportSuccessMessage(null);
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format: payload is not an object.');
      }

      if (!Array.isArray(parsed.widgets)) {
        throw new Error('Invalid backup file: missing "widgets" array.');
      }

      // Check each widget has id and type
      for (let i = 0; i < parsed.widgets.length; i++) {
        const w = parsed.widgets[i];
        if (!w.id || !w.type) {
          throw new Error(`Invalid widget definition at index ${i}.`);
        }
      }

      setParsedPackage(parsed as OrahExportPackage);
    } catch (err: any) {
      setParsedPackage(null);
      setImportError(err.message || 'Unable to parse JSON file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        validateAndStagePackage(content);
      }
    };
    reader.onerror = () => {
      setImportError('Error reading uploaded file.');
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setImportJsonText(content);
          validateAndStagePackage(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteRestore = () => {
    if (!parsedPackage) return;
    try {
      onApplyImport(parsedPackage);
      setImportSuccessMessage(
        `Successfully restored ${parsedPackage.widgets.length} widgets and preferences!`
      );
      setParsedPackage(null);
      setImportJsonText('');
      setTimeout(() => {
        setImportSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportError(`Failed to apply configuration: ${err.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#14161F] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="settings-modal-title"
                className="text-lg font-semibold text-stone-900 dark:text-stone-100"
              >
                Workspace Settings & Backup
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Export, import, or restore your dashboard layout and preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'backup'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Export / Import
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'preferences'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Halachic Preferences
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close settings modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {importSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          {importError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {activeTab === 'backup' ? (
            <div className="space-y-6">
              {/* Export Section */}
              <div className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Export Dashboard Layout</span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1">
                      Download Configuration JSON
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Includes all {widgets.length} widgets (arrangements, width column spans, active status, custom widgets), your location ({location.name}), Halachic Shita ({shita}), and personal settings.
                    </p>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0">
                    {widgets.filter((w) => w.visible).length} active
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                      <span>Import Dashboard Layout</span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1">
                      Restore from JSON File
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Upload a previously exported Orah configuration file to restore your customized homescreen.
                    </p>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`p-6 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2.5 ${
                    isDragOver
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-500/70 bg-white dark:bg-stone-900/50'
                  }`}
                >
                  <FileJson className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                  <div>
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
                      Drag & drop your .json backup file here, or
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Browse your device
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    Accepts valid Orah exported JSON configuration files
                  </span>
                </div>

                {/* Direct Paste Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasteArea((v) => !v)}
                    className="text-xs text-amber-800 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <span>{showPasteArea ? 'Hide text paste area' : 'Or paste raw JSON text directly'}</span>
                  </button>

                  {showPasteArea && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={4}
                        value={importJsonText}
                        onChange={(e) => {
                          setImportJsonText(e.target.value);
                          if (e.target.value.trim()) {
                            validateAndStagePackage(e.target.value);
                          }
                        }}
                        placeholder="Paste your JSON configuration string here..."
                        className="w-full text-xs font-mono p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => validateAndStagePackage(importJsonText)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                      >
                        Validate JSON
                      </button>
                    </div>
                  )}
                </div>

                {/* Staged Package Preview & Confirm Action */}
                {parsedPackage && (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Valid Configuration Ready to Restore</span>
                      </div>
                      <span className="font-mono text-[11px] text-stone-500">
                        Version {parsedPackage.version || 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200/50 dark:border-amber-900/40">
                        <span className="text-stone-400 block text-[10px]">Total Widgets</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                          {parsedPackage.widgets.length}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200/50 dark:border-amber-900/40">
                        <span className="text-stone-400 block text-[10px]">Active Widgets</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                          {parsedPackage.widgets.filter((w) => w.visible).length}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200/50 dark:border-amber-900/40">
                        <span className="text-stone-400 block text-[10px]">Saved Location</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                          {parsedPackage.preferences?.location?.name || 'Unchanged'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200/50 dark:border-amber-900/40">
                        <span className="text-stone-400 block text-[10px]">Halachic Shita</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                          {parsedPackage.preferences?.shita || 'GRA'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 rounded-lg transition-colors shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Apply & Restore Layout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParsedPackage(null);
                          setImportJsonText('');
                        }}
                        className="px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-medium text-stone-800 dark:text-stone-200">
                    Reset Workspace
                  </h5>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    Restore the default Bento grid arrangement and initial widget spans.
                  </p>
                </div>

                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetDefaults();
                        setShowResetConfirm(false);
                        setImportSuccessMessage('Reset to factory default widgets layout.');
                        setTimeout(() => setImportSuccessMessage(null), 2500);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Halachic Shita / Calculation Customization */}
              <div className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Halachic Calculation Method (Shita)</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select the Halachic authority for proportional hours (Sha’ot Zmaniyot) and Kriat Shema / Tefillah thresholds:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {[
                    {
                      id: 'GRA' as ShitaOpinion,
                      title: 'GRA (Vilna Gaon)',
                      desc: 'Sunrise (Netz) to Sunset (Shkiah). Universal Ashkenazi baseline.',
                    },
                    {
                      id: 'MGA' as ShitaOpinion,
                      title: 'Magen Avraham (MGA)',
                      desc: 'Dawn (Alot 72/90 min) to Nightfall (Tzeit). Earlier Shema threshold.',
                    },
                    {
                      id: 'BAAL_HATANYA' as ShitaOpinion,
                      title: 'Baal HaTanya (Chabad)',
                      desc: 'Calculated according to Shulchan Aruch HaRav and Seder HaHachnasah.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChangeShita(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        shita === item.id
                          ? 'border-amber-700 bg-white dark:bg-stone-900 ring-2 ring-amber-500/30'
                          : 'border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {item.title}
                        </span>
                        {shita === item.id && (
                          <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Candle Lighting Customization */}
              <div className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Candle Lighting Offset (Hadlakat Nerot)</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Minutes before Halachic Shkiah for Shabbat and Yom Tov candle lighting:
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[18, 20, 24, 30, 40].map((mins) => {
                    const isSelected = location.candleLightingMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() =>
                          onChangeLocation({
                            ...location,
                            candleLightingMinutes: mins,
                          })
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 font-semibold'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500/50'
                        }`}
                      >
                        {mins} minutes {mins === 40 ? '(Jerusalem standard)' : mins === 18 ? '(Standard Diaspora)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Orah Configuration Engine · Version 1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors font-medium"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
