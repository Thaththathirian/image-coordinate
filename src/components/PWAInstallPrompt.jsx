import React, { useState } from 'react';
import { usePWAInstallPrompt } from '../pwa/usePWAInstallPrompt';

const PWAInstallPrompt = ({ isOnline = true }) => {
  const { canInstall, requestInstall, isIOSDevice, hasPrompt } = usePWAInstallPrompt();
  const [installing, setInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstall = async () => {
    // iOS devices need manual instructions
    if (isIOSDevice) {
      setShowIOSInstructions(true);
      return;
    }

    // If browser doesn't support install prompt, show instructions
    if (!hasPrompt) {
      setStatusMessage('Install prompt not available. Visit chrome://apps or check your browser settings.');
      setTimeout(() => setStatusMessage(''), 5000);
      return;
    }

    setInstalling(true);
    setStatusMessage('');
    try {
      const outcome = await requestInstall();
      if (outcome?.outcome === 'accepted') {
        setStatusMessage('App is installing…');
      } else if (outcome?.outcome === 'dismissed') {
        setStatusMessage('Install dismissed');
      } else {
        setStatusMessage('Install cancelled');
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
    <>
      {/* Install button - only shows when canInstall is true */}
      {canInstall && (
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
      )}

      {/* iOS Installation Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Install on iOS
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>To install this app on your iPhone or iPad:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Tap the <strong>Share</strong> button{' '}
                  <span className="inline-block">
                    <svg
                      className="w-4 h-4 inline"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                    </svg>
                  </span>{' '}
                  in Safari
                </li>
                <li>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top right corner
                </li>
              </ol>
              <p className="text-xs text-gray-500 mt-4">
                Note: This only works in Safari browser on iOS devices.
              </p>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;

