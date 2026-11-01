import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Download,
  FileDown,
  Laptop,
  Share,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { LocationConfig, ZmanimData, ParshaData } from '../types/dashboard';
import { getHaYomYomForDate } from '../data/hayomYomData';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSwReady(true))
        .catch(() => setSwReady(false));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS: isIOS && !isInstalled,
    swReady,
    promptInstall,
  };
}

interface PWAInstallButtonProps {
  location: LocationConfig;
  zmanim: ZmanimData;
  selectedDate: Date;
  parsha: ParshaData | null;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  location,
  zmanim,
  selectedDate,
  parsha,
}) => {
  const { isInstallable, isInstalled, isIOS, swReady, promptInstall } =
    usePWAInstall();
  const isOnline = useOnlineStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadedPocketLuach, setDownloadedPocketLuach] = useState(false);

  const handlePrimaryClick = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (!accepted) {
        setIsModalOpen(true);
      }
      return;
    }
    setIsModalOpen(true);
  };

  // Generates a self-contained, zero-network offline HTML Luach & Study sheet that users can also save directly to disk/files
  const handleDownloadOfflineLuachFile = () => {
    const hayomYom = getHaYomYomForDate(selectedDate);
    const dateFormatted = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const zmanimRowsHtml = zmanim.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;font-weight:600;color:#1c1917;">${item.titleEn}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;color:#78350f;direction:rtl;">${item.titleHe}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;font-family:monospace;font-weight:700;color:#1c1917;">${item.formattedTime}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;color:#57534e;font-size:12px;">${item.halachicNote}</td>
        </tr>`
      )
      .join('');

    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orah Offline Luach — ${zmanim.hebrewDateEn} (${location.name})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; background: #FAF8F5; color: #1C1917; margin: 0; padding: 32px 20px; line-height: 1.55; }
    .container { max-width: 860px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { border-bottom: 2px solid #B45309; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; }
    .brand { font-size: 24px; font-weight: 700; color: #1C1917; }
    .sub { font-size: 13px; color: #78350F; font-weight: 600; }
    .card { background: #FAF8F5; border: 1px solid #E7E5E4; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .hebrew { font-size: 18px; direction: rtl; text-align: right; color: #1C1917; margin: 10px 0; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #D6D3D1; color: #57534E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { margin-top: 24px; font-size: 12px; color: #78716C; text-align: center; }
    @media print { body { padding: 0; background: #fff; } .container { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">Orah · אורה — Offline Daily Luach & Study Edition</div>
        <div class="sub">${zmanim.hebrewDateHe} · ${zmanim.hebrewDateEn} · ${dateFormatted}</div>
      </div>
      <div style="font-size:13px;color:#57534e;">
        <strong>${location.name}</strong> (${location.latitude.toFixed(2)}°N, ${location.longitude.toFixed(2)}°E)
      </div>
    </div>

    <div class="card">
      <div style="font-size:12px;font-weight:700;color:#B45309;text-transform:uppercase;letter-spacing:0.05em;">
        לוח היום יום · HaYom Yom (${hayomYom.hebrewDateDisplayHe} · ${hayomYom.hebrewDateDisplayEn})
      </div>
      <h2 style="margin:6px 0 8px;font-size:18px;">${hayomYom.titleEn} · ${hayomYom.titleHe}</h2>
      <div style="font-size:12px;color:#57534e;margin-bottom:10px;">
        <strong>Daily Tehillim:</strong> ${hayomYom.tehillimRangeEn} (${hayomYom.tehillimRangeHe}) ·
        <strong>Daily Tanya:</strong> ${hayomYom.tanyaPortionEn}
      </div>
      <div class="hebrew">${hayomYom.aphorismHe}</div>
      <p style="margin:8px 0;font-size:14px;color:#292524;">${hayomYom.aphorismEn}</p>
      <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #d6d3d1;font-size:13px;color:#78350f;">
        <strong>Practical Avodah:</strong> ${hayomYom.practicalAvodah}
      </div>
    </div>

    ${
      parsha
        ? `<div class="card">
            <div style="font-size:12px;font-weight:700;color:#B45309;text-transform:uppercase;">Weekly Parsha · ${parsha.nameEn} (${parsha.nameHe})</div>
            <p style="margin:6px 0;font-size:13px;"><strong>Torah Reading:</strong> ${parsha.fullRef} · <strong>Haftarah:</strong> ${parsha.haftarahRef}</p>
            <p style="margin:6px 0;font-size:13px;"><strong>Candle Lighting:</strong> ${parsha.candleLighting} · <strong>Havdalah:</strong> ${parsha.havdalah}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#44403c;">${parsha.summary}</p>
          </div>`
        : ''
    }

    <h3 style="font-size:16px;margin:20px 0 10px;">Halachic Zmanim (${location.name})</h3>
    <table>
      <thead>
        <tr>
          <th>Halachic Time</th>
          <th>Hebrew</th>
          <th>Local Time</th>
          <th>Halachic Definition</th>
        </tr>
      </thead>
      <tbody>
        ${zmanimRowsHtml}
      </tbody>
    </table>

    <div class="footer">
      Generated by Orah Offline Sanctuary · Works 100% offline on any device or browser · Print-ready for Erev Shabbat & Yom Tov
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ymd = selectedDate.toISOString().slice(0, 10);
    a.href = url;
    a.download = `Orah-Offline-Luach-${ymd}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedPocketLuach(true);
    setTimeout(() => setDownloadedPocketLuach(false), 3500);
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrimaryClick}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
          isInstalled
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/50'
        }`}
        title="Install Orah as an Offline Desktop/Mobile App or Download Offline Luach"
      >
        <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span>
          {isInstalled ? 'Offline App Ready' : 'Download Offline App'}
        </span>
        {!isOnline && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-amber-700 text-white font-mono">
            OFFLINE
          </span>
        )}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-offline-modal-title"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Progressive Web App & Offline Sanctuary</span>
                </div>
                <h3
                  id="pwa-offline-modal-title"
                  className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5"
                >
                  Download & Install Orah Offline App
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Close offline app dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Live Offline Engine Status */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {isOnline ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>
                        {swReady
                          ? 'Offline Service Worker Active & Cached'
                          : 'Offline Astronomical Engine Ready'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% Offline Capable
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      All NOAA astronomical Zmanim, Hebrew calendar Luach,{' '}
                      <strong>HaYom Yom</strong>, Daf Yomi cycles, Upcoming
                      Holidays, and the Mizrach compass calculate locally on your
                      device with zero internet required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action 1: Native PWA App Installation */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Option 1 · Install Standalone App to Home Screen / Desktop
                </div>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await promptInstall();
                      if (ok) setIsModalOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Orah App Now (One-Click Native Install)</span>
                  </button>
                ) : isIOS ? (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                      <Smartphone className="w-4 h-4" />
                      <span>Install on iPhone or iPad (iOS Safari)</span>
                    </div>
                    <ol className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-decimal list-inside">
                      <li>
                        Tap the{' '}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium">
                          <Share className="w-3 h-3 text-blue-600" /> Share
                        </span>{' '}
                        button in your Safari toolbar.
                      </li>
                      <li>
                        Scroll down and tap{' '}
                        <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                      </li>
                      <li>
                        Tap <strong>Add</strong> to launch Orah full-screen
                        anytime, even in Airplane Mode.
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        <Laptop className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Desktop Chrome / Edge / Brave</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                        Open Orah in its own browser tab and click the{' '}
                        <strong>Install Orah (⊕)</strong> icon on the right side
                        of your browser address bar.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        <Smartphone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>iOS Safari & Android</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                        Tap <strong>Share → Add to Home Screen</strong> (iOS) or{' '}
                        <strong>Menu (⋮) → Install App</strong> (Android Chrome)
                        for full offline access.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action 2: Direct Downloadable Offline HTML Luach Snapshot */}
              <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Option 2 · Download Portable Offline Luach File (.HTML)
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Save a self-contained offline Luach file for{' '}
                  <strong>{zmanim.hebrewDateEn}</strong> ({location.name})
                  containing today&rsquo;s <strong>HaYom Yom</strong>, Tehillim,
                  Parsha, and all 14 Halachic Zmanim to open without a browser
                  connection or print for Shabbat.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadOfflineLuachFile}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-amber-400 dark:text-amber-700" />
                  <span>
                    {downloadedPocketLuach
                      ? 'Downloaded Offline Luach HTML File!'
                      : `Download Portable Offline Luach (${zmanim.hebrewDateEn})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>
                Cached locally: Zmanim · HaYom Yom · Daf Yomi · Parsha · Compass
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg hover:bg-stone-300/70 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 px-3.5 py-2 rounded-xl shadow-lg text-xs font-medium border border-stone-700 dark:border-amber-400">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 dark:text-stone-950 shrink-0" />
      <span>
        Offline Sanctuary Active — Zmanim, HaYom Yom & Luach running locally
      </span>
    </div>
  );
};
