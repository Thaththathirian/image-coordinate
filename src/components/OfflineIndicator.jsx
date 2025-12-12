import React from 'react';

const OfflineIndicator = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500 text-white shadow-lg text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <span>Offline mode</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;

