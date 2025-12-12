// components/DiagramViewer.jsx (Final)
import React, { useState, useEffect, useRef } from 'react';
import ToolsBar from './ToolsBar';

const DiagramViewer = ({ 
  imageSrc, 
  coordinates, 
  imageName, 
  setCoordinates,
  onUploadNew,
  onImportCoordinates
}) => {
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formatType, setFormatType] = useState('json');
  const containerRef = useRef(null);
  const editInputRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && originalDimensions.width > 0) {
        setScale(containerRef.current.offsetWidth / originalDimensions.width);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, originalDimensions.width]);

  useEffect(() => {
    if (editingPoint && editInputRef.current) {
      editInputRef.current.focus();
      // Select all text for easy replacement
      editInputRef.current.select();
    }
  }, [editingPoint]);

  // Sort coordinates by number
  const getSortedCoordinates = () => {
    return [...coordinates].sort((a, b) => {
      const numA = parseInt(a.number || a.id, 10);
      const numB = parseInt(b.number || b.id, 10);
      return numA - numB;
    });
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  };

  const handlePointClick = (point) => {
    if (editMode) {
      setEditingPoint(point);
    } else {
      setSelectedPoint(selectedPoint && selectedPoint.id === point.id ? null : point);
    }
  };
  
  const handlePointDoubleClick = (e, point) => {
    e.stopPropagation();
    setEditingPoint(point);
  };

  const handleUpdateFieldValue = (id, field, value) => {
    const updatedCoordinates = coordinates.map(coord => 
      coord.id === id ? { ...coord, [field]: value } : coord
    );
    setCoordinates(updatedCoordinates);
  };

  const handleNumberEdit = (e) => {
    if (!editingPoint) return;
    
    const newNumber = e.target.value;
    handleUpdateFieldValue(editingPoint.id, 'number', newNumber);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingPoint(null);
    }
  };

  const renderShapePoint = (point) => {
    // Default shape is circle
    const shapeType = point.shapeType || 'circle';
    const isSelected = selectedPoint?.id === point.id;
    const isEditing = editingPoint?.id === point.id;
    
    switch(shapeType) {
      case 'rectangle':
        return (
          <div
            className={`absolute flex items-center justify-center bg-blue-500 bg-opacity-30 cursor-pointer transition-all text-white font-bold text-xs 
              ${isSelected ? 'ring-2 ring-white z-30' : 'z-10'}`}
            style={{
              left: `${point.x * scale}px`,
              top: `${point.y * scale}px`,
              width: `${(point.width || 40) * scale}px`,
              height: `${(point.height || 30) * scale}px`,
              transform: 'translate(0, 0)',
            }}
            onClick={() => handlePointClick(point)}
            onDoubleClick={(e) => handlePointDoubleClick(e, point)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleNumberEdit}
                onKeyDown={handleKeyDown}
                onBlur={() => setEditingPoint(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              point.number || point.id
            )}
          </div>
        );
      case 'triangle':
        return (
          <div
            className={`absolute flex items-center justify-center cursor-pointer transition-all text-white font-bold text-xs 
              ${isSelected ? 'ring-2 ring-white z-30' : 'z-10'}`}
            style={{
              left: `${point.x * scale}px`,
              top: `${point.y * scale}px`,
              width: `${(point.size || 40) * scale}px`,
              height: `${(point.size || 40) * scale}px`,
              transform: 'translate(-50%, -50%)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)',
            }}
            onClick={() => handlePointClick(point)}
            onDoubleClick={(e) => handlePointDoubleClick(e, point)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleNumberEdit}
                onKeyDown={handleKeyDown}
                onBlur={() => setEditingPoint(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded mt-4"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="mt-4">{point.number || point.id}</span>
            )}
          </div>
        );
      case 'polygon':
        return (
          <div
            className={`absolute flex items-center justify-center cursor-pointer transition-all text-white font-bold text-xs 
              ${isSelected ? 'ring-2 ring-white z-30' : 'z-10'}`}
            style={{
              left: `${point.x * scale}px`,
              top: `${point.y * scale}px`,
              width: `${(point.size || 40) * scale}px`,
              height: `${(point.size || 40) * scale}px`,
              transform: 'translate(-50%, -50%)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)',
            }}
            onClick={() => handlePointClick(point)}
            onDoubleClick={(e) => handlePointDoubleClick(e, point)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleNumberEdit}
                onKeyDown={handleKeyDown}
                onBlur={() => setEditingPoint(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              point.number || point.id
            )}
          </div>
        );
      case 'circle':
      default:
        return (
          <div
            className={`absolute flex items-center justify-center rounded-full bg-red-500 bg-opacity-30 cursor-pointer transition-all text-white font-bold text-xs
              ${isSelected ? 'ring-2 ring-white z-30' : 'z-10'}`}
            style={{
              left: `${point.x * scale}px`,
              top: `${point.y * scale}px`,
              width: `${(point.radius || 12) * 2 * scale}px`,
              height: `${(point.radius || 12) * 2 * scale}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handlePointClick(point)}
            onDoubleClick={(e) => handlePointDoubleClick(e, point)}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={point.number || point.id}
                onChange={handleNumberEdit}
                onKeyDown={handleKeyDown}
                onBlur={() => setEditingPoint(null)}
                className="w-10 h-6 p-1 text-xs text-center bg-white bg-opacity-90 text-black border border-white rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              point.number || point.id
            )}
          </div>
        );
    }
  };

  const handleCopyToClipboard = () => {
    // Create JSON with imageName as outer property
    const jsonData = {
      imageName,
      coordinates: getSortedCoordinates().map(coord => ({
        id: coord.id,
        x: coord.x,
        y: coord.y,
        number: coord.number || coord.id,
        description: coord.description || '',
        shapeType: coord.shapeType || 'circle',
        ...(coord.shapeType === 'circle' && { radius: coord.radius }),
        ...(coord.shapeType === 'rectangle' && { width: coord.width, height: coord.height }),
        ...((coord.shapeType === 'triangle' || coord.shapeType === 'polygon') && { size: coord.size })
      }))
    };
    
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert('Coordinates copied to clipboard!');
  };

  // Export coordinates to JSON or Object file
  const handleExportCoordinates = () => {
    // Sort coordinates by number
    const sortedCoordinates = getSortedCoordinates();
    
    // Create export data
    let dataStr;
    let fileExtension;
    
    if (formatType === 'object') {
      dataStr = `const coordinateData = {
  imageName: "${imageName}",
  coordinates: ${JSON.stringify(sortedCoordinates.map(coord => ({
    id: coord.id,
    x: coord.x,
    y: coord.y,
    number: coord.number || coord.id,
    description: coord.description || '',
    shapeType: coord.shapeType || 'circle',
    ...(coord.shapeType === 'circle' && { radius: coord.radius }),
    ...(coord.shapeType === 'rectangle' && { width: coord.width, height: coord.height }),
    ...((coord.shapeType === 'triangle' || coord.shapeType === 'polygon') && { size: coord.size })
  })), null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"([^"]+)"/g, '"$1"') // Keep quotes around string values
}
};`;
      fileExtension = 'js';
    } else {
      // Create JSON structure with imageName at top level
      const exportData = {
        imageName,
        coordinates: sortedCoordinates.map(coord => ({
          id: coord.id,
          x: coord.x,
          y: coord.y,
          number: coord.number || coord.id,
          description: coord.description || '',
          shapeType: coord.shapeType || 'circle',
          ...(coord.shapeType === 'circle' && { radius: coord.radius }),
          ...(coord.shapeType === 'rectangle' && { width: coord.width, height: coord.height }),
          ...((coord.shapeType === 'triangle' || coord.shapeType === 'polygon') && { size: coord.size })
        }))
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

  // Close the tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedPoint && 
          containerRef.current && 
          !event.target.closest('.point-indicator') && 
          !event.target.closest('.shape-indicator') && 
          !event.target.closest('.point-tooltip')) {
        setSelectedPoint(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedPoint]);

  return (
    <div className="flex flex-col space-y-6">
      <ToolsBar 
        onUploadNew={onUploadNew}
        onImportCoordinates={onImportCoordinates}
        onExportCoordinates={handleExportCoordinates}
        hasCoordinates={coordinates.length > 0}
        formatType={formatType}
      />
      
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="inline-flex items-center space-x-2 mr-4">
          <span className="text-sm text-gray-700">Export Format:</span>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${formatType === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setFormatType('json')}
          >
            JSON
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${formatType === 'object' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setFormatType('object')}
          >
            Object
          </button>
        </div>
        <button 
          className={`px-4 py-2 rounded text-sm font-medium transition-colors 
            ${editMode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Exit Edit Mode' : 'Edit Points'}
        </button>
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          onClick={handleCopyToClipboard}
        >
          Copy Coordinates
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative border border-gray-200 rounded overflow-hidden bg-gray-100 shadow max-w-4xl mx-auto"
      >
        <div className="relative">
          <img 
            src={imageSrc}
            alt="Technical diagram" 
            className="w-full h-auto block cursor-[crosshair]"
            onLoad={handleImageLoad}
          />
          
          {imageLoaded && getSortedCoordinates().map(point => renderShapePoint(point))}
          
          {selectedPoint && imageLoaded && !editMode && (
            <div 
              className="absolute bg-white p-3 border border-gray-200 rounded shadow-lg z-40 min-w-[200px] max-w-[280px] transform -translate-y-1/2"
              style={{
                left: `${Math.min(selectedPoint.x * scale + 20, containerRef.current.offsetWidth - 200)}px`,
                top: `${selectedPoint.y * scale}px`,
              }}
            >
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                <h3 className="text-blue-700 font-medium text-base">Point #{selectedPoint.number || selectedPoint.id}</h3>
                <button 
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setSelectedPoint(null)}
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-gray-700">
                {selectedPoint.description || `No description available`}
                <div className="mt-2 text-xs text-gray-500 pt-2 border-t border-dashed border-gray-200">
                  Position: ({selectedPoint.x}, {selectedPoint.y})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded max-w-4xl mx-auto">
        <h3 className="text-lg font-medium text-blue-700 mb-3">Diagram Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Image:</span>
            <span className="text-base font-medium">{imageName || 'Unnamed'}</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Points:</span>
            <span className="text-base font-medium">{coordinates.length}</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Dimensions:</span>
            <span className="text-base font-medium">{originalDimensions.width} × {originalDimensions.height}px</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Scale:</span>
            <span className="text-base font-medium">{scale.toFixed(2)}×</span>
          </div>
        </div>
        
        <p className="text-center text-gray-500 italic text-sm">
          {editMode ? 'Click on a point to edit its number' : 'Click on any point to see details, double-click to edit number'}
        </p>
      </div>
      
      {coordinates.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <h3 className="text-lg font-medium text-blue-700 mb-3">Edit Coordinates</h3>
          <div className="overflow-x-auto border border-gray-200 rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedCoordinates().map((point, index) => (
                  <tr key={point.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={point.number || point.id}
                        onChange={(e) => handleUpdateFieldValue(point.id, 'number', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        value={point.x}
                        onChange={(e) => handleUpdateFieldValue(point.id, 'x', parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        value={point.y}
                        onChange={(e) => handleUpdateFieldValue(point.id, 'y', parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={point.description || ''}
                        onChange={(e) => handleUpdateFieldValue(point.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramViewer;