import React, { useState, useEffect } from 'react';
import ItemMenu from './ItemMenu';
import API from '../services/api';

// Maps for dynamic sizing of the icon and text
const iconSizes = {
  small: 'h-8 w-8',
  medium: 'h-12 w-12',
  large: 'h-16 w-16',
};

const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
};

// Resizable, generic file icon used as a fallback
const FileIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSizes[size]} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

function FileItem({ file, onRename, onDelete, onPlay, size = 'medium' }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    // Reset thumbnail when the file changes
    setThumbnailUrl(null);
    
    const fetchThumbnail = async () => {
      try {
        // file.linkid is the unique ID for the file
        const response = await API.get(`/files/thumbnail/${file.linkid}`);
        if (response.data.thumbnail_url) {
          setThumbnailUrl(response.data.thumbnail_url);
        }
      } catch (error) {
        // If there's an error (like a 404), we simply won't show a thumbnail.
      }
    };

    // Only try to fetch a thumbnail if it's a completed video
    if (file.convert === 'converted' || 'no-need') {
        fetchThumbnail();
    }
  }, [file.linkid]); // Re-fetch if the file ID changes

  const menuOptions = [
    { label: 'Rename', action: () => onRename(file) },
    { label: 'Delete', action: () => onDelete(file), isDestructive: true },
  ];

  return (
    <div
      onClick={() => onPlay(file)}
      className="p-2 bg-gray-50 rounded-lg text-center cursor-pointer group relative flex flex-col justify-between hover:bg-blue-50 transition-colors duration-200"
    >
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ItemMenu options={menuOptions} />
      </div>

      {/* Main content area for the thumbnail or icon */}
      <div className={`w-full ${size === 'small' ? 'h-16' : size === 'medium' ? 'h-24' : 'h-32'} bg-gray-200 rounded-md flex items-center justify-center overflow-hidden mb-2`}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <FileIcon size={size} />
        )}
      </div>

      <p className={`${textSizes[size]} font-medium text-gray-700 w-full break-words`}>
        {file.name}
      </p>
    </div>
  );
}

export default FileItem;