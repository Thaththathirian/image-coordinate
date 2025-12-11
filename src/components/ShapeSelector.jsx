// components/ShapeSelector.jsx
import React from 'react';

const ShapeSelector = ({ currentShape, setCurrentShape }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center">
        <button 
          className={`w-12 h-12 flex items-center justify-center border text-lg transition-colors rounded-md
            ${currentShape === 'circle' 
              ? 'bg-blue-500 text-white border-blue-600 shadow-inner' 
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setCurrentShape('circle')}
          title="Circle"
        >
          ⬤
        </button>
        <button 
          className={`w-12 h-12 flex items-center justify-center border text-lg transition-colors rounded-md
            ${currentShape === 'rectangle' 
              ? 'bg-blue-500 text-white border-blue-600 shadow-inner' 
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setCurrentShape('rectangle')}
          title="Rectangle"
        >
          ▬
        </button>
        <button 
          className={`w-12 h-12 flex items-center justify-center border text-lg transition-colors rounded-md
            ${currentShape === 'triangle' 
              ? 'bg-blue-500 text-white border-blue-600 shadow-inner' 
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setCurrentShape('triangle')}
          title="Triangle"
        >
          ▲
        </button>
        <button 
          className={`w-12 h-12 flex items-center justify-center border text-lg transition-colors rounded-md
            ${currentShape === 'polygon' 
              ? 'bg-blue-500 text-white border-blue-600 shadow-inner' 
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setCurrentShape('polygon')}
          title="Polygon"
        >
          ◆
        </button>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-1">
        Select shape type
      </div>
    </div>
  );
};

export default ShapeSelector;