import { useCallback, useEffect, useState } from 'react';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const isInStandaloneMode = () => {
  return isStandalone();
};

export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    setIsIOSDevice(isIOS());

    const handleBeforeInstall = (event) => {
      console.log('beforeinstallprompt event fired');
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      console.log('appinstalled event fired');
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    // Log current state for debugging
    console.log('PWA Install Hook initialized:', {
      isStandalone: isStandalone(),
      isIOS: isIOS(),
      hasServiceWorker: 'serviceWorker' in navigator
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const requestInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('No deferred prompt available');
      return { outcome: 'dismissed' };
    }

    try {
      console.log('Showing install prompt...');
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('User choice:', choice);
      setDeferredPrompt(null);
      return choice;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return { outcome: 'error', error };
    }
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt) || (isIOSDevice && !isInStandaloneMode()), // Show button when prompt is available OR on iOS
    requestInstall,
    isIOSDevice: isIOSDevice && !isInStandaloneMode(),
    isInstalled: installed,
    hasPrompt: Boolean(deferredPrompt),
  };
}

