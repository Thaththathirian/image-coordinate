// App.jsx - Main application file with improved data management
import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import DiagramViewer from './components/DiagramViewer';
import CoordinateExtractor from './components/CoordinateExtractor';
import UploadScreen from './components/UploadScreen';

function App() {
  const [mode, setMode] = useState('viewer'); // 'viewer' or 'extractor'
  const [diagramSrc, setDiagramSrc] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [imageName, setImageName] = useState('');

  // Load previously saved state on component mount
  useEffect(() => {
    try {
      // Try to load the last active diagram
      const lastSession = localStorage.getItem('diagram-last-session');
      if (lastSession) {
        const { imageName, imageData } = JSON.parse(lastSession);
        if (imageName && imageData) {
          setImageName(imageName);
          setDiagramSrc(imageData);
          
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
    }
  }, []);

  // Save the current session whenever diagramSrc or imageName changes
  useEffect(() => {
    if (diagramSrc && imageName) {
      try {
        localStorage.setItem('diagram-last-session', JSON.stringify({
          imageName,
          imageData: diagramSrc
        }));
      } catch (err) {
        console.error("Error saving session:", err);
      }
    }
  }, [diagramSrc, imageName]);
  
  // Main route handler based on current state
  const renderContent = () => {
    if (!diagramSrc) {
      return (
        <UploadScreen 
          onFileUpload={(src, name) => {
            setDiagramSrc(src);
            setImageName(name);
          }} 
        />
      );
    }
    
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
          onExportCoordinates={() => {
            // Export functionality handled within the component
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
            setMode('viewer');
          }}
          imageName={imageName}
          onUploadNew={() => setDiagramSrc(null)}
          onImportCoordinates={(newCoords, newName) => {
            setCoordinates(newCoords);
            if (newName) setImageName(newName);
          }}
          onExportCoordinates={() => {
            // Export functionality handled within the component
          }}
        />
      );
    }
  };

  return (
    <MainLayout
      mode={mode}
      setMode={setMode}
      showControls={!!diagramSrc}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;