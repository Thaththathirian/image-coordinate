// components/ToolsBar.jsx (Improved)
import React from 'react';

const ToolsBar = ({ 
  onUploadNew, 
  onImportCoordinates, 
  onExportCoordinates, 
  hasCoordinates,
  formatType = 'json'  // Default to 'json' if not provided
}) => {
  
  // Import coordinates from JSON file
  const handleImportCoordinates = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Try to parse the JSON
          const importedData = JSON.parse(e.target.result);
          
          // Check if the JSON has the new format with imageName at the top level
          if (importedData.imageName && Array.isArray(importedData.coordinates)) {
            onImportCoordinates(importedData.coordinates, importedData.imageName);
            alert(`Successfully imported ${importedData.coordinates.length} coordinates!`);
          } 
          // Check if it's the old format (just an array of coordinates)
          else if (Array.isArray(importedData)) {
            // Check if we have an imageName in the first coordinate
            let imageName = null;
            if (importedData.length > 0 && importedData[0].imageName) {
              imageName = importedData[0].imageName;
            }
            
            onImportCoordinates(importedData, imageName);
            alert(`Successfully imported ${importedData.length} coordinates!`);
          }
          else {
            throw new Error("Invalid JSON format");
          }
        } catch (error) {
          alert('Error importing coordinates: Invalid JSON file');
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Determine export button label based on format type
  const getExportButtonLabel = () => {
    if (formatType === 'object') {
      return 'Export OBJ Coordinates';
    }
    return 'Export JSON Coordinates';
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 hover:-translate-y-0.5 transition-all font-medium text-sm"
        onClick={onUploadNew}
      >
        Upload New Diagram
      </button>
      
      <label className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 hover:-translate-y-0.5 transition-all font-medium text-sm cursor-pointer">
        Import Coordinates
        <input 
          type="file" 
          accept=".json" 
          onChange={handleImportCoordinates} 
          className="hidden"
        />
      </label>
      
      {hasCoordinates && (
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 hover:-translate-y-0.5 transition-all font-medium text-sm"
          onClick={onExportCoordinates}
        >
          {getExportButtonLabel()}
        </button>
      )}
    </div>
  );
};

export default ToolsBar;