import React, { useState } from 'react';
import { usePWAInstallPrompt } from '../pwa/usePWAInstallPrompt';

const PWAInstallPrompt = ({ isOnline = true }) => {
  const { canInstall, requestInstall } = usePWAInstallPrompt();
  const [installing, setInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    setStatusMessage('');
    try {
      const outcome = await requestInstall();
      if (outcome?.outcome === 'accepted') {
        setStatusMessage('App is installing…');
      } else {
        setStatusMessage('Install dismissed');
      }
    } catch (error) {
      setStatusMessage('Install failed');
      console.error('PWA install failed:', error);
    } finally {
      setInstalling(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        disabled={!isOnline || installing}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-blue-100 text-sm font-medium transition-colors ${
          isOnline
            ? 'bg-white text-blue-700 hover:bg-blue-600 hover:text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        title={isOnline ? 'Install the app' : 'Connect to install'}
      >
        <span className="inline-flex h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
        {installing ? 'Preparing…' : 'Install app'}
      </button>
      {statusMessage && (
        <p className="mt-1 text-xs text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm">
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default PWAInstallPrompt;

