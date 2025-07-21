import React from "react";
import { useNavigate } from "react-router-dom";
import useFileStore from "../store/fileStore";
import ItemMenu from "./ItemMenu";

// Maps for dynamic sizing of the icon and text
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

// Resizable Folder Icon component
const FolderIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${iconSizes[size]} text-yellow-500 mx-auto`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

function FolderItem({ folder, onRename, onDelete, size = "medium" }) {
  const navigate = useNavigate();
  const { breadcrumb, setBreadcrumb } = useFileStore();

  const menuOptions = [
    { label: "Rename", action: () => onRename(folder) },
    { label: "Delete", action: () => onDelete(folder), isDestructive: true },
  ];

  const handleFolderClick = () => {
    // When a folder is clicked, add it to the current breadcrumb path
    const newBreadcrumb = [...breadcrumb, { id: folder.id, name: folder.name }];
    setBreadcrumb(newBreadcrumb);
    navigate(`/files/${folder.id}`);
  };

  return (
    <div
      onClick={handleFolderClick}
      className="p-4 bg-gray-50 rounded-lg text-center hover:bg-blue-100 transition-colors duration-200 cursor-pointer group relative flex flex-col justify-between"
    >
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ItemMenu options={menuOptions} />
      </div>

      {/* Main content area */}
      <div className="flex-grow flex items-center justify-center">
        <FolderIcon size={size} />
      </div>

      <p
        className={`${textSizes[size]} font-medium text-gray-700 mt-2 w-full break-words`}
      >
        {folder.name}
      </p>
    </div>
  );
}

export default FolderItem;
