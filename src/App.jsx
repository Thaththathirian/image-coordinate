// App.jsx - Main application file with improved data management
import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import DiagramViewer from './components/DiagramViewer';
import CoordinateExtractor from './components/CoordinateExtractor';
import UploadScreen from './components/UploadScreen';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { saveImageData, getImageData } from './utils/imageCache';

function App() {
  const [mode, setMode] = useState('viewer'); // 'viewer' or 'extractor'

  const handleSetMode = (newMode) => {
    console.log('Setting mode from', mode, 'to', newMode);
    setMode(newMode);
  };
  const [diagramSrc, setDiagramSrc] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [imageName, setImageName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isOnline = useNetworkStatus();

  // Load previously saved state on component mount
  useEffect(() => {
    async function loadSession() {
      try {
        // restore last selected mode
        const savedMode = localStorage.getItem('diagram-last-mode');
        console.log('Loading saved mode:', savedMode);
        if (savedMode === 'viewer' || savedMode === 'extractor') {
          handleSetMode(savedMode);
          console.log('Mode set to:', savedMode);
        } else {
          console.log('No valid saved mode found, using default');
        }

        // Try to load the last active diagram
        const lastSession = localStorage.getItem('diagram-last-session');
        if (lastSession) {
          const { imageName } = JSON.parse(lastSession);
          if (imageName) {
            // Try to get image from IndexedDB first (more reliable for large images)
            const imageDataFromDB = await getImageData(imageName);

            if (imageDataFromDB) {
              console.log('Image loaded from IndexedDB:', imageName);
              setImageName(imageName);
              setDiagramSrc(imageDataFromDB);
            } else {
              // Fallback to localStorage if IndexedDB doesn't have it
              const { imageData } = JSON.parse(lastSession);
              if (imageData) {
                console.log('Image loaded from localStorage:', imageName);
                setImageName(imageName);
                setDiagramSrc(imageData);
                // Save to IndexedDB for future use
                await saveImageData(imageName, imageData);
              }
            }

            // Load coordinates for this image
            const savedData = localStorage.getItem(`diagram-coordinates-${imageName}`);
            if (savedData) {
              const { coordinates } = JSON.parse(savedData);
              if (Array.isArray(coordinates)) {
                setCoordinates(coordinates);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading saved session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  // Save the current session whenever diagramSrc or imageName changes
  useEffect(() => {
    async function saveSession() {
      if (diagramSrc && imageName) {
        try {
          // Save to localStorage (metadata + small reference)
          localStorage.setItem('diagram-last-session', JSON.stringify({
            imageName,
            imageData: diagramSrc
          }));

          // Save full image data to IndexedDB (better for large images)
          await saveImageData(imageName, diagramSrc);
        } catch (err) {
          console.error("Error saving session:", err);
        }
      }
    }

    saveSession();
  }, [diagramSrc, imageName]);

  // Persist selected mode so refresh keeps user on same tab
  useEffect(() => {
    try {
      console.log('Saving mode to localStorage:', mode);
      localStorage.setItem('diagram-last-mode', mode);
    } catch (err) {
      console.error("Error saving mode:", err);
    }
  }, [mode]);
  
  // Main route handler based on current state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-600">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span>Loading…</span>
          </div>
        </div>
      );
    }

    if (!diagramSrc) {
      return (
        <UploadScreen
          onFileUpload={(src, name) => {
            setDiagramSrc(src);
            setImageName(name);
          }}
          isOnline={isOnline}
        />
      );
    }

    // Show offline message when working with cached content
    if (!isOnline) {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">!</span>
              <span className="font-medium">Working offline</span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              You're viewing previously loaded content. Some features may be limited until you reconnect.
            </p>
          </div>
          {renderMainContent()}
        </div>
      );
    }

    return renderMainContent();
  };

  const renderMainContent = () => {
    if (mode === 'viewer') {
      return (
        <DiagramViewer
          imageSrc={diagramSrc}
          coordinates={coordinates}
          imageName={imageName}
          setCoordinates={setCoordinates}
          onUploadNew={() => setDiagramSrc(null)}
          onImportCoordinates={(newCoords, newName) => {
            setCoordinates(newCoords);
            if (newName) setImageName(newName);
          }}
        />
      );
    } else {
      return (
        <CoordinateExtractor
          imageSrc={diagramSrc}
          initialCoordinates={coordinates}
          onSaveCoordinates={newCoordinates => {
            setCoordinates(newCoordinates);
            handleSetMode('viewer');
          }}
          imageName={imageName}
          onUploadNew={() => setDiagramSrc(null)}
          onImportCoordinates={(newCoords, newName) => {
            setCoordinates(newCoords);
            if (newName) setImageName(newName);
          }}
        />
      );
    }
  };

  return (
    <MainLayout
      mode={mode}
      setMode={handleSetMode}
      showControls={!!diagramSrc}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;