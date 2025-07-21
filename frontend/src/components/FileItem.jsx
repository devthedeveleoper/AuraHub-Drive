import React, { useState, useEffect } from 'react';
import ItemMenu from './ItemMenu';
import API from '../services/api';

const iconSizes = {
  small: "h-8 w-8",
  medium: "h-12 w-12",
  large: "h-16 w-16",
};

const textSizes = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

// Generic file icon, used as a fallback
const FileIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSizes[size]} text-gray-400 mx-auto`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

function FileItem({ file, onRename, onDelete }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        // file.linkid is the unique ID for the file
        const response = await API.get(`/files/thumbnail/${file.linkid}`);
        if (response.data.thumbnail_url) {
          setThumbnailUrl(response.data.thumbnail_url);
        }
      } catch (error) {
        // If there's an error (like a 404), we just won't show a thumbnail.
        // console.log(`No thumbnail for ${file.name}`);
      }
    };

    fetchThumbnail();
  }, [file.linkid, file.name]); // Re-fetch if the file ID changes

  const menuOptions = [
    { label: 'Rename', action: () => onRename(file) },
    { label: 'Delete', action: () => onDelete(file), isDestructive: true },
  ];

  return (
    <div className="p-2 bg-gray-50 rounded-lg text-center cursor-pointer group relative">
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ItemMenu options={menuOptions} />
      </div>

      {/* The main content area */}
      <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <FileIcon />
        )}
      </div>

      <p className="text-xs font-medium text-gray-700 mt-2 w-full break-words">
        {file.name}
      </p>
    </div>
  );
}

export default FileItem;