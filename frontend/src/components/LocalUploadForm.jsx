import React, { useState } from "react";

function LocalUploadForm({ onUpload, isUploading }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass all the form data up to the parent component's handler
    onUpload({ file, title, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="file"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Video File {"(15 GB Max 🫠)"}
        </label>
        <input
          id="file"
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="local-title"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Title
        </label>
        <input
          id="local-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Title for your video"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="local-description"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Description
        </label>
        <textarea
          id="local-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="A description for your video."
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isUploading}
        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-green-300 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}

export default LocalUploadForm;
