// layouts/MainLayout.jsx
import React, { useState } from 'react';
import Instructions from '../components/Instructions';
import OfflineIndicator from '../components/OfflineIndicator';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const MainLayout = ({ children, mode, setMode, showControls }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const isOnline = useNetworkStatus();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <OfflineIndicator isOnline={isOnline} />
      <PWAInstallPrompt isOnline={isOnline} />
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-4">
          Image Coordinator
        </h1>
        {showControls && (
          <div className="flex max-w-md mx-auto">
            <button 
              className={`flex-1 py-2 px-4 font-medium text-sm uppercase tracking-wider rounded-l-md transition-colors 
                ${mode === 'viewer' 
                  ? 'bg-blue-500 text-white shadow-inner' 
                  : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setMode('viewer')}
            >
              Viewer Mode
            </button>
            <button 
              className={`flex-1 py-2 px-4 font-medium text-sm uppercase tracking-wider rounded-r-md transition-colors 
                ${mode === 'extractor' 
                  ? 'bg-blue-500 text-white shadow-inner' 
                  : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setMode('extractor')}
            >
              Coordinate Extractor
            </button>
          </div>
        )}
      </header>
      
      <main className="bg-white p-4 sm:p-6 rounded-md shadow mb-6">
        {children}
      </main>
      
      <footer className="text-center py-4 text-gray-600 text-sm border-t border-gray-200 mt-8">
        <p>
        Image Coordinator © {new Date().getFullYear()} | 
          <button 
            className="text-blue-500 hover:text-blue-700 mx-1 underline"
            onClick={() => setShowInstructions(true)}
          >
            Show Instructions
          </button>
        </p>
        
        {showInstructions && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInstructions(false)}
          >
            <div 
              className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Instructions onClose={() => setShowInstructions(false)} />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default MainLayout;