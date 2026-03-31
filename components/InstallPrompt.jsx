import { useEffect, useState, useSyncExternalStore } from 'react';
import { Download, Share2 } from 'lucide-react';

let cachedState = null;
const serverState = { isInstalled: true, showIosHint: false };

function getInstallState() {
  if (typeof window === 'undefined') {
    return serverState;
  }

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);

  const showIosHint = isIos && isSafari && !isInstalled;

  if (cachedState && cachedState.isInstalled === isInstalled && cachedState.showIosHint === showIosHint) {
    return cachedState;
  }

  cachedState = {
    isInstalled,
    showIosHint,
  };
  return cachedState;
}

function subscribeToInstallState(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const displayMode = window.matchMedia('(display-mode: standalone)');
  const handleChange = () => callback();

  displayMode.addEventListener?.('change', handleChange);
  window.addEventListener('appinstalled', handleChange);

  return () => {
    displayMode.removeEventListener?.('change', handleChange);
    window.removeEventListener('appinstalled', handleChange);
  };
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { isInstalled, showIosHint } = useSyncExternalStore(
    subscribeToInstallState,
    getInstallState,
    () => serverState
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled || (!deferredPrompt && !showIosHint)) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-24 md:bottom-6 z-[60] max-w-xs">
      <div
        className="border-2 px-4 py-3 shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--accent)',
          color: 'var(--foreground)',
          borderRadius: 'var(--border-radius)',
        }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50">
          App Mode
        </p>
        <p className="mt-2 text-sm leading-5">
          {deferredPrompt
            ? 'Install HONEST. Briefs for a full-screen app experience.'
            : 'On iPhone, tap Share and then Add to Home Screen.'}
        </p>
        {deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-transform hover:-translate-y-px"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--btn-color)',
              borderRadius: 'var(--pill-radius)',
            }}
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        ) : (
          <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
            <Share2 className="h-4 w-4" />
            Add To Home Screen
          </div>
        )}
      </div>
    </div>
  );
}
