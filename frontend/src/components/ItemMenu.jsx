import React, { useState, useEffect, useRef } from 'react';

// Three dots icon
const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

function ItemMenu({ options }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent parent onClick handlers from firing
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-full hover:bg-gray-200"
      >
        <MoreIcon />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border rounded-md shadow-lg py-1 z-20 w-32">
          <ul>
            {options.map((option) => (
              <li
                key={option.label}
                onClick={() => handleOptionClick(option.action)}
                className={`px-4 py-2 text-sm cursor-pointer ${
                  option.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ItemMenu;