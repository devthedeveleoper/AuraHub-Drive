import React, { useState } from 'react';
import LocalUploadForm from './LocalUploadForm';
import RemoteUploadForm from './RemoteUploadForm';
import ProgressIndicator from './ProgressIndicator';

function UploadModal({
  isOpen,
  onClose,
  onLocalUpload, // Handler for local uploads
  onRemoteUpload, // Handler for remote uploads
  isUploading,
  progressData
}) {
  const [activeTab, setActiveTab] = useState('local');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {isUploading ? 'Upload in Progress' : 'Upload to Folder'}
          </h3>
          <button onClick={onClose} disabled={isUploading} className="text-gray-500 hover:text-gray-800 text-2xl disabled:opacity-50">&times;</button>
        </div>

        {isUploading && activeTab === 'local' ? (
          <ProgressIndicator
            progress={progressData.progress}
            uploadSpeed={progressData.speed}
            timeRemaining={progressData.timeRemaining}
            fileName={progressData.fileName}
          />
        ) : (
          <>
            <div className="flex border-b mb-6">
              <button onClick={() => setActiveTab('local')} className={`py-2 px-4 -mb-px font-semibold ${activeTab === 'local' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>Local File</button>
              <button onClick={() => setActiveTab('remote')} className={`py-2 px-4 -mb-px font-semibold ${activeTab === 'remote' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-500'}`}>Remote URL</button>
            </div>
            
            {activeTab === 'local' ? (
              <LocalUploadForm onUpload={onLocalUpload} isUploading={isUploading} />
            ) : (
              <RemoteUploadForm onUpload={onRemoteUpload} isUploading={isUploading} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UploadModal;