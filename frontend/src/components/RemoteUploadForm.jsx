import React, { useState } from 'react';

function RemoteUploadForm({ onUpload, isUploading }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload({ url, title, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">Video URL</label>
        <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="https://example.com/video.mp4"/>
      </div>
      <div className="mb-4">
        <label htmlFor="remote-title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
        <input id="remote-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="Title for the remote video"/>
      </div>
      <div className="mb-6">
        <label htmlFor="remote-description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
        <textarea id="remote-description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4"
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="A description for the video."></textarea>
      </div>
      <button type="submit" disabled={isUploading} className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-purple-300">
        {isUploading ? 'Initiating...' : 'Start Remote Upload'}
      </button>
    </form>
  );
}

export default RemoteUploadForm;