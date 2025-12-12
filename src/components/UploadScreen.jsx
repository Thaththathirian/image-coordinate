// components/UploadScreen.jsx
import React, { useState } from 'react';
import Instructions from './Instructions';

const UploadScreen = ({ onFileUpload }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      // Get image name without extension
      const fullName = file.name;
      const nameParts = fullName.split('.');
      const nameWithoutExtension = nameParts.slice(0, -1).join('.');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileUpload(e.target.result, nameWithoutExtension);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Upload Technical Diagram</h2>
      <p className="text-gray-600 mb-6 max-w-md">Upload your technical diagram to begin</p>
      
      <div className="w-full max-w-md py-8 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload} 
          className="hidden"
          id="diagram-upload"
        />
        <label htmlFor="diagram-upload" className="flex flex-col items-center cursor-pointer">
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <span className="text-sm text-gray-600">Click to browse files</span>
          <span className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
        </label>
      </div>
      
      <div className="mt-6">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => setShowInstructions(true)}
        >
          View Instructions
        </button>
      </div>
      
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
    </div>
  );
};

export default UploadScreen;