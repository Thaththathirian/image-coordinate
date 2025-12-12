// components/Instructions.jsx
import React from 'react';

const Instructions = ({ onClose }) => {
  return (
    <div className="p-6 relative">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
        Instructions
      </h3>
      <button 
        className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
        onClick={onClose}
      >
        ×
      </button>
      
      <p className="mb-4 text-gray-700">
        This application helps you extract coordinates from technical diagrams and create responsive image maps:
      </p>
      
      <ol className="mb-6 pl-6 space-y-2 list-decimal text-gray-700">
        <li>Upload your technical diagram using the button provided</li>
        <li>Use the "Coordinate Extractor" to mark and identify points and shapes on your diagram</li>
        <li>Switch to "Viewer Mode" to see the interactive diagram</li>
        <li>Export your coordinates to reuse them later</li>
      </ol>
      
      <h4 className="text-lg font-semibold mb-2 text-gray-800">New Features:</h4>
      <ul className="mb-4 pl-6 space-y-2 list-square text-gray-700">
        <li>Edit coordinates directly from the table</li>
        <li>Create different shapes (circle, rectangle, triangle, polygon)</li>
        <li>Customize shapes with different sizes and dimensions</li>
        <li><strong>Double-click</strong> any shape to edit its number directly</li>
        <li>One-click copy for coordinates data</li>
        <li>Your work is automatically saved and persists between sessions</li>
        <li>Coordinate shapes are ordered by their number, not creation order</li>
      </ul>
      
      <p className="text-gray-700">
        The coordinates will scale responsively across different screen sizes.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Instructions;