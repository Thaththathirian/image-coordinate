// components/CoordinateExtractor.jsx (Final Updates)
import React, { useState, useEffect, useRef } from 'react';
import ToolsBar from './ToolsBar';
import ShapeControls from './ShapeControls';
import CoordinateTable from './CoordinateTable';

const CoordinateExtractor = ({ 
  imageSrc, 
  initialCoordinates = [], 
  onSaveCoordinates, 
  imageName: initialImageName,
  onUploadNew,
  onImportCoordinates,
  onExportCoordinates
}) => {
  // Load coordinates and name from localStorage if available
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(`diagram-coordinates-${initialImageName}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          coordinates: parsed.coordinates || [],
          imageName: parsed.imageName || initialImageName
        };
      }
    } catch (err) {
      console.error("Error loading saved data:", err);
    }
    return {
      coordinates: initialCoordinates,
      imageName: initialImageName
    };
  };
  
  const savedData = loadSavedData();
  const [coordinates, setCoordinates] = useState(savedData.coordinates);
  const [imageName, setImageName] = useState(savedData.imageName);
  const [currentId, setCurrentId] = useState(1);
  const [customId, setCustomId] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [currentShape, setCurrentShape] = useState('circle');
  const [shapeSize, setShapeSize] = useState({
    radius: 12,
    width: 40,
    height: 30,
    size: 40 // For triangle and polygon
  });
  const [sizeUnit, setSizeUnit] = useState('px');
  const [editingPointId, setEditingPointId] = useState(null);
  const [formatType, setFormatType] = useState('json'); // 'json' or 'object'
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredPointId, setHoveredPointId] = useState(null);
  const [deleteButtonHover, setDeleteButtonHover] = useState(false);
  
  const imageRef = useRef(null);
  const extractorRef = useRef(null);
  const editInputRef = useRef(null);

  // Save coordinates to localStorage whenever they change
  useEffect(() => {
    if (imageName) {
      try {
        const savedData = {
          imageName,
          coordinates: coordinates
        };
        localStorage.setItem(`diagram-coordinates-${imageName}`, JSON.stringify(savedData));
      } catch (err) {
        console.error("Error saving coordinates:", err);
      }
    }
  }, [coordinates, imageName]);

  // Set the initial current ID based on existing coordinates
  useEffect(() => {
    if (coordinates.length > 0) {
      // Find the highest ID and set currentId to one higher
      const maxId = Math.max(...coordinates.map(coord => coord.id));
      setCurrentId(maxId + 1);
    }
  }, [coordinates]);

  // Focus edit input when editing a point
  useEffect(() => {
    if (editingPointId !== null && editInputRef.current) {
      // Focus and empty the input for easier editing
      editInputRef.current.focus();
      // Delay the selection slightly to ensure it works across browsers
      setTimeout(() => {
        editInputRef.current.select();
      }, 10);
    }
  }, [editingPointId]);

  // Add event listeners for mouse up when dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (draggingPoint) {
        setDraggingPoint(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPoint]);

  // Add event listeners for mouse move when dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingPoint && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const scaleX = imageRef.current.naturalWidth / rect.width;
        const scaleY = imageRef.current.naturalHeight / rect.height;
        
        // Calculate new position
        let newX = Math.round((e.clientX - rect.left - dragOffset.x) * scaleX);
        let newY = Math.round((e.clientY - rect.top - dragOffset.y) * scaleY);
        
        // Keep coordinates within image bounds
        newX = Math.max(0, Math.min(newX, originalDimensions.width));
        newY = Math.max(0, Math.min(newY, originalDimensions.height));
        
        // Update coordinates
        const updatedCoordinates = coordinates.map(coord => 
          coord.id === draggingPoint ? { ...coord, x: newX, y: newY } : coord
        );
        
        setCoordinates(updatedCoordinates);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [draggingPoint, coordinates, dragOffset, originalDimensions]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
  };

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
    
    // Use custom ID if provided, otherwise use currentId
    const idToUse = customId ? parseInt(customId, 10) : currentId;
    const numberToUse = customNumber || idToUse.toString();
    
    // Check if this ID already exists
    const existingIndex = coordinates.findIndex(coord => coord.id === idToUse);
    
    if (existingIndex >= 0) {
      // Update existing coordinate instead of adding a new one
      const updatedCoordinates = [...coordinates];
      updatedCoordinates[existingIndex] = {
        ...updatedCoordinates[existingIndex],
        x: originalX,
        y: originalY
      };
      setCoordinates(updatedCoordinates);
    } else {
      // Create shape specific attributes
      let shapeAttributes = {};
      
      switch(currentShape) {
        case 'rectangle':
          shapeAttributes = {
            shapeType: 'rectangle',
            width: shapeSize.width,
            height: shapeSize.height
          };
          break;
        case 'triangle':
          shapeAttributes = {
            shapeType: 'triangle',
            size: shapeSize.size
          };
          break;
        case 'polygon':
          shapeAttributes = {
            shapeType: 'polygon',
            size: shapeSize.size
          };
          break;
        case 'circle':
        default:
          shapeAttributes = {
            shapeType: 'circle',
            radius: shapeSize.radius
          };
      }
      
      // Add to coordinates array
      setCoordinates([...coordinates, { 
        id: idToUse, 
        x: originalX, 
        y: originalY,
        number: numberToUse,
        ...shapeAttributes
      }]);
      
      // Increment current ID only if we used it
      if (!customId) {
        setCurrentId(currentId + 1);
      }
    }
    
    // Reset custom inputs
    setCustomId('');
    setCustomNumber('');
  };

  const handleShapeDoubleClick = (e, pointId) => {
    e.stopPropagation();
    setEditingPointId(pointId);
  };
  
  const handleEditNumberChange = (e) => {
    if (editingPointId === null) return;
    
    const newNumber = e.target.value;
    handleUpdateField(editingPointId, 'number', newNumber);
  };
  
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingPointId(null);
    }
    // Let all other keys (including backspace/delete) work normally
  };

  const handleDragStart = (e, pointId) => {
    e.stopPropagation();
    
    if (editingPointId) return; // Don't start dragging during edit mode
    
    // Find the point in the coordinates
    const point = coordinates.find(coord => coord.id === pointId);
    if (!point) return;

    // Calculate drag offset
    const rect = imageRef.current.getBoundingClientRect();
    const displayX = (point.x / originalDimensions.width) * rect.width;
    const displayY = (point.y / originalDimensions.height) * rect.height;
    
    // Offset depends on shape type
    let offsetX = 0;
    let offsetY = 0;
    
    switch(point.shapeType) {
      case 'rectangle':
        // For rectangles, offset is 0,0 as we use top-left corner
        offsetX = e.clientX - rect.left - displayX;
        offsetY = e.clientY - rect.top - displayY;
        break;
      case 'circle':
      case 'triangle':
      case 'polygon':
      default:
        // For these shapes, we use center point (hence -50% in CSS transform)
        offsetX = e.clientX - rect.left - displayX;
        offsetY = e.clientY - rect.top - displayY;
        break;
    }
    
    setDraggingPoint(pointId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDeletePoint = (e, pointId) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm('Are you sure you want to delete this point?')) {
      const updatedCoordinates = coordinates.filter(coord => coord.id !== pointId);
      setCoordinates(updatedCoordinates);
    }
  };

  // Get coordinates sorted by number
  const getSortedCoordinates = () => {
    return [...coordinates].sort((a, b) => {
      const numA = parseInt(a.number || a.id, 10);
      const numB = parseInt(b.number || b.id, 10);
      return numA - numB;
    });
  };
  
  // Format coordinates for export - assign sequential IDs based on number order
  const getFormattedCoordinates = () => {
    const sortedCoords = getSortedCoordinates();
    
    return sortedCoords.map((coord, index) => ({
      id: index + 1,
      x: coord.x,
      y: coord.y,
      number: coord.number || coord.id.toString()
    }));
  };

  const handleCopyToClipboard = () => {
    // Get coordinates with sequential IDs based on number order
    const formattedCoordinates = getFormattedCoordinates();
    
    // Format based on selected type
    let textToCopy;
    
    if (formatType === 'object') {
      textToCopy = `const coordinateData = {
  imageName: "${imageName}",
  coordinates: ${JSON.stringify(formattedCoordinates, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"([^"]+)"/g, '"$1"') // Keep quotes around string values
}
};`;
    } else {
      // JSON format
      textToCopy = JSON.stringify({ imageName, coordinates: formattedCoordinates }, null, 2);
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveLast = () => {
    if (coordinates.length > 0) {
      const newCoords = [...coordinates];
      newCoords.pop();
      setCoordinates(newCoords);
    }
  };
  
  const handleRemoveAll = () => {
    if (window.confirm("Are you sure you want to remove all coordinates?")) {
      setCoordinates([]);
      setCurrentId(1);
    }
  };
  
  const handleUpdateField = (id, field, value) => {
    const updatedCoordinates = coordinates.map(coord => 
      coord.id === id ? { ...coord, [field]: value } : coord
    );
    setCoordinates(updatedCoordinates);
  };
  
  const handleRemovePoint = (id) => {
    const updatedCoordinates = coordinates.filter(coord => coord.id !== id);
    setCoordinates(updatedCoordinates);
  };
  
  const handleSaveCoordinates = () => {
    if (typeof onSaveCoordinates === 'function') {
      // Get coordinates with sequential IDs based on number order
      const formattedCoordinates = getFormattedCoordinates();
      
      // Add back the shape attributes for internal use
      const finalCoordinates = formattedCoordinates.map((formattedCoord) => {
        // Find the original coordinate with all properties
        const originalCoord = coordinates.find(
          c => c.x === formattedCoord.x && c.y === formattedCoord.y && c.number === formattedCoord.number
        );
        
        if (originalCoord) {
          return {
            ...formattedCoord,
            shapeType: originalCoord.shapeType,
            ...(originalCoord.shapeType === 'circle' && { radius: originalCoord.radius }),
            ...(originalCoord.shapeType === 'rectangle' && { 
              width: originalCoord.width, 
              height: originalCoord.height 
            }),
            ...((originalCoord.shapeType === 'triangle' || originalCoord.shapeType === 'polygon') && { 
              size: originalCoord.size 
            })
          };
        }
        
        return formattedCoord;
      });
      
      onSaveCoordinates(finalCoordinates);
    }
  };

  const handleShapeSizeChange = (sizeType, value) => {
    setShapeSize({
      ...shapeSize,
      [sizeType]: parseInt(value, 10)
    });
  };

  // Export coordinates to JSON or Object file
  const handleExportCoordinates = () => {
    // Get coordinates with sequential IDs based on number order
    const formattedCoordinates = getFormattedCoordinates();
    
    // Create export data
    let dataStr;
    let fileExtension;
    
    if (formatType === 'object') {
      dataStr = `const coordinateData = {
  imageName: "${imageName}",
  coordinates: ${JSON.stringify(formattedCoordinates, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"([^"]+)"/g, '"$1"') // Keep quotes around string values
}
};`;
      fileExtension = 'js';
    } else {
      const exportData = {
        imageName,
        coordinates: formattedCoordinates
      };
      dataStr = JSON.stringify(exportData, null, 2);
      fileExtension = 'json';
    }
    
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${imageName || 'diagram'}-coordinates.${fileExtension}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderShape = (point) => {
    const shapeType = point.shapeType || 'circle';
    const isEditing = editingPointId === point.id;
    const isDragging = draggingPoint === point.id;
    
    // Common classes for all shapes
    const shapeClasses = "absolute";
    
    // Delete button - positioned near the shape with smaller size and transparent background
    const deleteButton = (
      (hoveredPointId === point.id || deleteButtonHover) && (
        <button 
          className="absolute -top-3 -right-3 w-4 h-4 bg-gray-400 bg-opacity-80 rounded-full text-black text-xs flex items-center justify-center z-50"
          onClick={(e) => handleDeletePoint(e, point.id)}
          onMouseEnter={() => setDeleteButtonHover(true)}
          onMouseLeave={() => setDeleteButtonHover(false)}
          title="Delete point"
        >
          ×
        </button>
      )
    );
    
    switch(shapeType) {
      case 'rectangle':
        return (
          <div
            key={point.id}
            className={`${shapeClasses} group flex items-center justify-center bg-blue-500 bg-opacity-30 text-white font-bold text-xs cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
            style={{
              left: `${(point.x / originalDimensions.width) * 100}%`,
              top: `${(point.y / originalDimensions.height) * 100}%`,
              width: `${(point.width / originalDimensions.width) * 100}%`,
              height: `${(point.height / originalDimensions.height) * 100}%`,
            }}
            title={`Point #${point.number || point.id}: (${point.x}, ${point.y})`}
            onMouseDown={(e) => handleDragStart(e, point.id)}
            onDoubleClick={(e) => handleShapeDoubleClick(e, point.id)}
            onMouseEnter={() => setHoveredPointId(point.id)}
            onMouseLeave={() => {
              setHoveredPointId(null);
              setDeleteButtonHover(false);
            }}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleEditNumberChange}
                onKeyDown={handleEditKeyDown}
                onBlur={() => setEditingPointId(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded z-50"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              point.number || point.id
            )}
            {deleteButton}
          </div>
        );
      case 'triangle':
        return (
          <div
            key={point.id}
            className={`${shapeClasses} group flex items-center justify-center text-white font-bold text-xs cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
            style={{
              left: `${(point.x / originalDimensions.width) * 100}%`,
              top: `${(point.y / originalDimensions.height) * 100}%`,
              width: `${(point.size / originalDimensions.width) * 100}%`,
              height: `${(point.size / originalDimensions.height) * 100}%`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              backgroundColor: 'rgba(16, 185, 129, 0.3)',
              transform: 'translate(-50%, -50%)'
            }}
            title={`Point #${point.number || point.id}: (${point.x}, ${point.y})`}
            onMouseDown={(e) => handleDragStart(e, point.id)}
            onDoubleClick={(e) => handleShapeDoubleClick(e, point.id)}
            onMouseEnter={() => setHoveredPointId(point.id)}
            onMouseLeave={() => setHoveredPointId(null)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleEditNumberChange}
                onKeyDown={handleEditKeyDown}
                onBlur={() => setEditingPointId(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded mt-4 z-50"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="mt-4">{point.number || point.id}</span>
            )}
            {deleteButton}
          </div>
        );
      case 'polygon':
        return (
          <div
            key={point.id}
            className={`${shapeClasses} group flex items-center justify-center text-white font-bold text-xs cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
            style={{
              left: `${(point.x / originalDimensions.width) * 100}%`,
              top: `${(point.y / originalDimensions.height) * 100}%`,
              width: `${(point.size / originalDimensions.width) * 100}%`,
              height: `${(point.size / originalDimensions.height) * 100}%`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              backgroundColor: 'rgba(245, 158, 11, 0.3)',
              transform: 'translate(-50%, -50%)'
            }}
            title={`Point #${point.number || point.id}: (${point.x}, ${point.y})`}
            onMouseDown={(e) => handleDragStart(e, point.id)}
            onDoubleClick={(e) => handleShapeDoubleClick(e, point.id)}
            onMouseEnter={() => setHoveredPointId(point.id)}
            onMouseLeave={() => setHoveredPointId(null)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleEditNumberChange}
                onKeyDown={handleEditKeyDown}
                onBlur={() => setEditingPointId(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded z-50"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              point.number || point.id
            )}
            {deleteButton}
          </div>
        );
      case 'circle':
      default:
        return (
          <div
            key={point.id}
            className={`${shapeClasses} group flex items-center justify-center rounded-full bg-red-500 bg-opacity-30 text-white font-bold text-xs cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
            style={{
              left: `${(point.x / originalDimensions.width) * 100}%`,
              top: `${(point.y / originalDimensions.height) * 100}%`,
              width: `${((point.radius || 12) * 2 / originalDimensions.width) * 100}%`,
              height: `${((point.radius || 12) * 2 / originalDimensions.height) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            title={`Point #${point.number || point.id}: (${point.x}, ${point.y})`}
            onMouseDown={(e) => handleDragStart(e, point.id)}
            onDoubleClick={(e) => handleShapeDoubleClick(e, point.id)}
            onMouseEnter={() => setHoveredPointId(point.id)}
            onMouseLeave={() => setHoveredPointId(null)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleEditNumberChange}
                onKeyDown={handleEditKeyDown}
                onBlur={() => setEditingPointId(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded z-50"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              point.number || point.id
            )}
            {deleteButton}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-6" ref={extractorRef}>
      <ToolsBar 
        onUploadNew={onUploadNew}
        onImportCoordinates={onImportCoordinates}
        onExportCoordinates={handleExportCoordinates}
        hasCoordinates={coordinates.length > 0}
        formatType={formatType}
      />
      
      <ShapeControls
        currentId={currentId}
        customId={customId}
        setCustomId={setCustomId}
        customNumber={customNumber}
        setCustomNumber={setCustomNumber}
        currentShape={currentShape}
        setCurrentShape={setCurrentShape}
        shapeSize={shapeSize}
        handleShapeSizeChange={handleShapeSizeChange}
        sizeUnit={sizeUnit}
        setSizeUnit={setSizeUnit}
        copied={copied}
        handleCopyToClipboard={handleCopyToClipboard}
        handleRemoveLast={handleRemoveLast}
        handleRemoveAll={handleRemoveAll}
        handleSaveCoordinates={handleSaveCoordinates}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        coordinates={coordinates}
      />
      
      {/* Format selector for JSON or Object */}
      <div className="flex justify-center mb-2">
        <div className="bg-white border border-gray-200 rounded-lg p-2 inline-flex">
          <span className="text-sm text-gray-700 mr-3 self-center">Output Format:</span>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${formatType === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setFormatType('json')}
          >
            JSON
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ml-1 transition-colors ${formatType === 'object' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setFormatType('object')}
          >
            Object
          </button>
        </div>
      </div>
      
      {showHelp && (
        <div className="bg-amber-50 border border-amber-200 p-4 sm:p-6 rounded shadow-sm">
          <h3 className="text-lg font-medium text-amber-800 mb-3 pb-2 border-b border-amber-200">How to Use the Coordinate Extractor</h3>
          <ol className="pl-6 mb-4 space-y-2 list-decimal text-amber-900">
            <li>Click directly on the diagram to add points or shapes</li>
            <li>By default, points are numbered sequentially (1, 2, 3...)</li>
            <li>To specify a specific ID or number, enter it in the ID/Number fields before clicking</li>
            <li>Choose different shapes by clicking the shape buttons</li>
            <li>Adjust shape size parameters as needed</li>
            <li><strong>Drag shapes</strong> to reposition them</li>
            <li><strong>Double-click</strong> on any shape to edit its number</li>
            <li><strong>Hover and click the × button</strong> to delete a shape</li>
            <li>Edit coordinates in the table below</li>
            <li>When finished, click "Save Coordinates" to apply them to the viewer</li>
          </ol>
          <p className="text-amber-700 italic">Coordinates are automatically saved to your browser and will persist even if you refresh the page.</p>
        </div>
      )}
      
      <div className="relative border border-gray-200 rounded overflow-hidden bg-gray-100 shadow max-w-4xl mx-auto">
        <div className="relative">
          <img 
            ref={imageRef}
            src={imageSrc}
            alt="Extract coordinates" 
            className="w-full h-auto block"
            style={{ cursor: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20"><line x1="10" y1="0" x2="10" y2="20" stroke="black" stroke-width="2"/><line x1="0" y1="10" x2="20" y2="10" stroke="black" stroke-width="2"/></svg>\') 12 12, crosshair' }}
            onClick={handleImageClick}
            onLoad={handleImageLoad}
          />
          
          {coordinates.map(point => renderShape(point))}
        </div>
      </div>
      
      {coordinates.length > 0 && (
        <CoordinateTable 
          coordinates={coordinates}
          handleUpdateField={handleUpdateField}
          handleRemovePoint={handleRemovePoint}
          imageName={imageName}
          onImageNameChange={setImageName}
        />
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-blue-700 mb-3 flex justify-between items-center">
          {formatType === 'json' ? 'JSON Data' : 'JavaScript Object'} 
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors" 
            onClick={handleCopyToClipboard} 
            title="Click to copy"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </h3>
        <pre className="bg-gray-900 text-gray-300 p-4 rounded shadow-inner overflow-auto max-h-80 font-mono text-sm">
          {formatType === 'object' ? 
            `const coordinateData = {
  imageName: "${imageName}",
  coordinates: ${JSON.stringify(getFormattedCoordinates(), null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"([^"]+)"/g, '"$1"') // Keep quotes around string values
}
};` :
            JSON.stringify(
              {
                imageName,
                coordinates: getFormattedCoordinates()
              }, 
              null, 2
            )
          }
        </pre>
      </div>
    </div>
  );
};

export default CoordinateExtractor;