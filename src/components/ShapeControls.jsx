// components/ShapeControls.jsx
import React from "react";
import ShapeSelector from "./ShapeSelector";

const ShapeControls = ({
  currentId,
  customId,
  setCustomId,
  customNumber,
  setCustomNumber,
  currentShape,
  setCurrentShape,
  shapeSize,
  handleShapeSizeChange,
  sizeUnit,
  setSizeUnit,
  copied,
  handleCopyToClipboard,
  handleRemoveLast,
  handleRemoveAll,
  handleSaveCoordinates,
  showHelp,
  setShowHelp,
  coordinates,
}) => {
  // Render shape size controls based on selected shape
  const renderShapeSizeControls = () => {
    switch (currentShape) {
      case "rectangle":
        return (
          <>
            <div className="flex items-center gap-2 mr-4">
              <label
                htmlFor="rect-width"
                className="font-medium text-sm text-gray-700 min-w-[60px]"
              >
                Width:
              </label>
              <input
                id="rect-width"
                type="number"
                value={shapeSize.width}
                onChange={(e) => handleShapeSizeChange("width", e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">{sizeUnit}</span>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="rect-height"
                className="font-medium text-sm text-gray-700 min-w-[60px]"
              >
                Height:
              </label>
              <input
                id="rect-height"
                type="number"
                value={shapeSize.height}
                onChange={(e) =>
                  handleShapeSizeChange("height", e.target.value)
                }
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">{sizeUnit}</span>
            </div>
          </>
        );
      case "triangle":
      case "polygon":
        return (
          <div className="flex items-center gap-2">
            <label
              htmlFor="shape-size"
              className="font-medium text-sm text-gray-700 min-w-[60px]"
            >
              Size:
            </label>
            <input
              id="shape-size"
              type="number"
              value={shapeSize.size}
              onChange={(e) => handleShapeSizeChange("size", e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">{sizeUnit}</span>
          </div>
        );
      case "circle":
      default:
        return (
          <div className="flex items-center gap-2">
            <label
              htmlFor="circle-radius"
              className="font-medium text-sm text-gray-700 min-w-[60px]"
            >
              Radius:
            </label>
            <input
              id="circle-radius"
              type="number"
              value={shapeSize.radius}
              onChange={(e) => handleShapeSizeChange("radius", e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">{sizeUnit}</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded flex flex-wrap justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {/* Input Controls Section */}
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Input Controls
          </h3>
          <div className="flex items-center gap-2">
            <label
              htmlFor="custom-id"
              className="font-medium text-sm text-gray-700 min-w-[60px]"
            >
              ID:
            </label>
            <input
              id="custom-id"
              type="number"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder={`Next: ${currentId}`}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="custom-number"
              className="font-medium text-sm text-gray-700 min-w-[60px]"
            >
              Number:
            </label>
            <input
              id="custom-number"
              type="text"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              placeholder="Same as ID"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="size-unit"
              className="font-medium text-sm text-gray-700 min-w-[60px]"
            >
              Unit:
            </label>
            <select
              id="size-unit"
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="px">px</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

        {/* Shape Controls Section */}
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm h-full">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Shape Type</h3>
          <div className="flex flex-col gap-2">
            <ShapeSelector
              currentShape={currentShape}
              setCurrentShape={setCurrentShape}
            />

            <div className="mt-4 flex flex-col gap-2">
              {renderShapeSizeControls()}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm h-full">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="px-3 py-2 bg-blue-400 text-white rounded shadow hover:bg-blue-500 transition-colors text-sm font-medium"
              onClick={handleCopyToClipboard}
            >
              {copied ? "✓ Copied!" : "Copy JSON"}
            </button>

            <button
              // className="px-3 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors text-sm font-medium"
              onClick={handleRemoveLast}
              disabled={coordinates.length === 0}
              className={`px-3 py-2 ${
                coordinates.length === 0
                  ? "bg-red-300"
                  : "bg-red-500 hover:bg-red-600"
              } text-white rounded shadow transition-colors text-sm font-medium`}
            >
              Remove Last
            </button>

            <button
              onClick={handleRemoveAll}
              disabled={coordinates.length === 0}
              className={`px-3 py-2 ${
                coordinates.length === 0
                  ? "bg-red-300"
                  : "bg-red-500 hover:bg-red-600"
              } text-white rounded shadow transition-colors text-sm font-medium`}
            >
              Remove All
            </button>

            <button
              onClick={handleSaveCoordinates}
              disabled={coordinates.length === 0}
              className={`px-3 py-2 ${
                coordinates.length === 0
                  ? "bg-green-300"
                  : "bg-green-500 hover:bg-green-600"
              } text-white rounded shadow transition-colors text-sm font-medium`}
            >
              Save Coordinates
            </button>

            <button
              className="px-3 py-2 bg-amber-500 text-white rounded shadow hover:bg-amber-600 transition-colors text-sm font-medium col-span-2"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeControls;
