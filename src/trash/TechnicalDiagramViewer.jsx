// This file contains two parts:
// 1. A diagram viewer React component that works with the coordinates
// 2. A coordinate extraction helper function to use if you need to extract coordinates from similar diagrams

import React, { useState, useEffect, useRef } from 'react';

// ========================================================
// PART 1: RESPONSIVE DIAGRAM VIEWER COMPONENT
// ========================================================

const TechnicalDiagramViewer = ({ imageSrc, coordinates }) => {
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const containerRef = useRef(null);
  
  // Fetch the original dimensions from the first image load
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 800, // Default/fallback value
    height: 700 // Default/fallback value
  });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / originalDimensions.width);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, originalDimensions.width]);

  const handleImageLoad = (e) => {
    // Get the natural dimensions of the image
    const { naturalWidth, naturalHeight } = e.target;
    setOriginalDimensions({
      width: naturalWidth,
      height: naturalHeight
    });
    setImageLoaded(true);
  };

  const handlePointClick = (point) => {
    setSelectedPoint(selectedPoint && selectedPoint.id === point.id ? null : point);
  };

  // Style for the diagram container - relative positioning for absolute children
  const containerStyle = {
    position: 'relative',
    maxWidth: '100%',
    margin: '0 auto',
    border: '1px solid #ddd',
    overflow: 'hidden'
  };

  // Style for the circles indicating parts
  const circleStyle = (point) => ({
    position: 'absolute',
    left: `${point.x * scale}px`,
    top: `${point.y * scale}px`,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: selectedPoint?.id === point.id ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 0, 0, 0.5)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    transition: 'background-color 0.2s ease',
    zIndex: 10
  });

  // Style for the tooltip that appears when a point is clicked
  const tooltipStyle = selectedPoint ? {
    position: 'absolute',
    left: `${Math.min(selectedPoint.x * scale + 20, (containerRef.current?.offsetWidth || 0) - 150)}px`,
    top: `${selectedPoint.y * scale}px`,
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 20,
    minWidth: '150px',
    transform: 'translateY(-50%)'
  } : {};

  return (
    <div>
      <div 
        ref={containerRef}
        style={containerStyle}
      >
        <img 
          src={imageSrc}
          alt="Technical diagram" 
          style={{ width: '100%', display: 'block' }}
          onLoad={handleImageLoad}
        />
        
        {imageLoaded && coordinates.map(point => (
          <div
            key={point.id}
            style={circleStyle(point)}
            onClick={() => handlePointClick(point)}
          >
            {point.id}
          </div>
        ))}
        
        {selectedPoint && (
          <div style={tooltipStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong>Part #{selectedPoint.id}</strong>
              <button 
                onClick={() => setSelectedPoint(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '14px' }}>
              {selectedPoint.description || `No description available`}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Position: ({selectedPoint.x}, {selectedPoint.y})
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '14px' }}>
        <p><strong>Instructions:</strong> Click on any numbered circle to see details.</p>
      </div>
    </div>
  );
};

// Example usage:
// <TechnicalDiagramViewer 
//   imageSrc="/path/to/your/diagram.jpg" 
//   coordinates={coordinatesArray} 
// />

// ========================================================
// PART 2: COORDINATES EXTRACTION HELPER (BROWSER-BASED)
// ========================================================

// This function helps you extract coordinates by clicking on an image
// It's a development tool to help generate the coordinates array
const CoordinateExtractor = ({ imageSrc }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [currentId, setCurrentId] = useState(1);
  const [copied, setCopied] = useState(false);
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    
    // Get click coordinates relative to the image
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Scale to original image dimensions if needed
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const originalX = Math.round(x * scaleX);
    const originalY = Math.round(y * scaleY);
    
    // Add to coordinates array
    setCoordinates([...coordinates, { 
      id: currentId, 
      x: originalX, 
      y: originalY,
      description: `Part #${currentId}`
    }]);
    
    setCurrentId(currentId + 1);
  };

  const handleCopyToClipboard = () => {
    const jsonStr = JSON.stringify(coordinates, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveLast = () => {
    if (coordinates.length > 0) {
      const newCoords = [...coordinates];
      newCoords.pop();
      setCoordinates(newCoords);
      setCurrentId(currentId - 1);
    }
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <h2>Coordinate Extractor Tool</h2>
      <p>Click on the image to mark points and extract coordinates</p>
      
      <div style={{ position: 'relative', border: '1px solid #ddd', marginBottom: '20px' }}>
        <img 
          ref={imageRef}
          src={imageSrc}
          alt="Extract coordinates" 
          style={{ maxWidth: '100%', display: 'block' }}
          onClick={handleImageClick}
        />
        
        {coordinates.map(point => (
          <div
            key={point.id}
            style={{
              position: 'absolute',
              left: `${point.x / (imageRef.current?.naturalWidth || 1) * 100}%`,
              top: `${point.y / (imageRef.current?.naturalHeight || 1) * 100}%`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            {point.id}
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleCopyToClipboard}
          style={{
            padding: '8px 16px',
            backgroundColor: copied ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {copied ? 'Copied!' : 'Copy Coordinates'}
        </button>
        
        <button
          onClick={handleRemoveLast}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Remove Last Point
        </button>
      </div>
      
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {JSON.stringify(coordinates, null, 2)}
        </pre>
      </div>
      
      <p><strong>Total Points:</strong> {coordinates.length}</p>
    </div>
  );
};

