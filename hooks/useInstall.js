import { useEffect, useState, useSyncExternalStore } from 'react';

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

export function useInstall() {
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
      if (showIosHint) {
        alert('On iPhone, tap Share and then Add to Home Screen.');
      }
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
       console.log("User accepted the install prompt");
    }
    setDeferredPrompt(null);
  };

  const showInstallOptions = !isInstalled && (deferredPrompt || showIosHint);

  return { isInstalled, showIosHint, deferredPrompt, handleInstall, showInstallOptions };
}
