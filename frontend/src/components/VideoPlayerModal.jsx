import React from 'react';

function VideoPlayerModal({ isOpen, onClose, fileId }) {
  if (!isOpen || !fileId) return null;

  const embedUrl = `https://streamtape.com/e/${fileId}`;

  return (
    // Modal Backdrop: Covers the whole screen and closes the modal on click
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/*
        Modal Content Container with Glowing Border Effect
        - The box-shadow creates the blue glow.
        - e.stopPropagation() prevents the modal from closing if you click on the player itself.
      */}
      <div
        className="bg-black p-1 rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 15px 3px rgba(59, 130, 246, 0.6)', // Glowing blue border effect
        }}
      >
        <div className="aspect-video w-[90vw] max-w-4xl">
          <iframe
            src={embedUrl}
            allowFullScreen
            className="w-full h-full rounded-md"
            title="Video Player"
          ></iframe>
        </div>
      </div>

      {/* Close button in the top right corner */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 transition-colors"
      >
        &times;
      </button>
    </div>
  );
}

export default VideoPlayerModal;