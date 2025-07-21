import React from 'react';

function FileManagerToolbar({ searchTerm, onSearchChange, sortOption, onSortChange, cardSize, onCardSizeChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {/* Search Bar */}
      <div className="flex-grow">
        <input
          type="text"
          placeholder="Search in this folder..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Sorting Dropdown */}
        <div>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            {/* Add other sort options like 'date' later if the API provides it */}
          </select>
        </div>

        {/* Card Size Toggles */}
        <div className="flex items-center border rounded-md p-1 bg-white">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => onCardSizeChange(size)}
              className={`px-2 py-1 text-sm rounded ${cardSize === size ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              {size.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FileManagerToolbar;