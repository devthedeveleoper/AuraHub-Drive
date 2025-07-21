import React from 'react';
import { formatTime } from '../utils/formatTime'; // Make sure you have this utility file

function ProgressIndicator({ progress, uploadSpeed, timeRemaining, fileName }) {
  return (
    <div className="text-center p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Uploading: <span className="font-normal break-all">{fileName}</span>
      </h3>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-width duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xl font-bold text-blue-600">{progress}%</p>
      {/* Progress Details */}
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Speed: {uploadSpeed.toFixed(2)} MB/s</span>
        <span>Time Remaining: {formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
}

export default ProgressIndicator;