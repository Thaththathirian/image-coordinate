// components/CoordinateTable.jsx (Revised)
import React from 'react';

const CoordinateTable = ({ 
  coordinates, 
  handleUpdateField, 
  handleRemovePoint,
  imageName,
  onImageNameChange 
}) => {
  // Function to sort coordinates by number
  const getSortedCoordinates = () => {
    return [...coordinates].sort((a, b) => {
      const numA = parseInt(a.number || a.id, 10);
      const numB = parseInt(b.number || b.id, 10);
      return numA - numB;
    });
  };

  // Sort coordinates and assign sequential IDs for display based on order
  const getSortedAndSequencedCoordinates = () => {
    const sorted = getSortedCoordinates();
    return sorted.map((coord, index) => ({
      ...coord,
      displayId: index + 1  // Sequential ID based on sorted order
    }));
  };

  return (
    <div className="max-w-4xl mx-auto w-full mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-blue-700">
          Extracted Coordinates ({coordinates.length} points)
        </h3>
        <div className="flex items-center">
          <label className="mr-2 font-medium text-gray-700">Image Name:</label>
          <input
            type="text"
            value={imageName}
            onChange={(e) => onImageNameChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter image name"
          />
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shape</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedAndSequencedCoordinates().map(point => (
              <tr key={point.id} className="hover:bg-blue-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{point.displayId}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={point.number || point.id}
                    onChange={(e) => handleUpdateField(point.id, 'number', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={point.x}
                    onChange={(e) => handleUpdateField(point.id, 'x', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={point.y}
                    onChange={(e) => handleUpdateField(point.id, 'y', parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {point.shapeType || 'circle'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button 
                    className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    onClick={() => handleRemovePoint(point.id)}
                    title="Remove point"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoordinateTable;