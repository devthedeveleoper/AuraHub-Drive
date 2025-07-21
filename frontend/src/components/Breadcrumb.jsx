import React from 'react';
import { Link } from 'react-router-dom';
import useFileStore from '../store/fileStore';

function Breadcrumb() {
  const { breadcrumb, setBreadcrumb } = useFileStore();

  const handleCrumbClick = (index) => {
    // When a breadcrumb link is clicked, cut the path back to that point
    const newPath = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newPath);
  };

  return (
    <div className="text-sm text-gray-500 flex items-center space-x-2 flex-wrap">
      {breadcrumb.map((crumb, index) => (
        <React.Fragment key={crumb.id || 'root'}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <Link
            to={crumb.id ? `/files/${crumb.id}` : '/files'}
            onClick={() => handleCrumbClick(index)}
            className={`font-semibold ${index === breadcrumb.length - 1 ? 'text-gray-700' : 'text-blue-600 hover:underline'}`}
          >
            {crumb.name}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;