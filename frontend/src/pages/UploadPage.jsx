import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import axios from 'axios';
import { formatTime } from '../utils/formatTime';

// Import the new components
import LocalUploadForm from '../components/LocalUploadForm';
import RemoteUploadForm from '../components/RemoteUploadForm';

const ProgressIndicator = ({ progress, uploadSpeed, timeRemaining, fileName }) => (
  // ... (ProgressIndicator component remains the same as before)
  <div className="text-center">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Uploading: {fileName}</h3>
    <div className="w-full bg-gray-200 rounded-full h-4 mb-4"><div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div></div>
    <p className="text-xl font-bold text-blue-600">{progress}%</p>
    <div className="flex justify-between text-sm text-gray-600 mt-2">
      <span>Speed: {uploadSpeed.toFixed(2)} MB/s</span>
      <span>Time Remaining: {formatTime(timeRemaining)}</span>
    </div>
  </div>
);

function UploadPage() {
  const [activeTab, setActiveTab] = useState('local');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const progressHistory = useRef({ lastLoaded: 0, lastTime: Date.now() });

  const navigate = useNavigate();

  const handleLocalUpload = async ({ file, title, description }) => {
    if (!file || !title) return toast.error('Please select a file and provide a title.');
    
    setIsUploading(true);
    setFileName(file.name);
    setProgress(0); setUploadSpeed(0); setTimeRemaining(0);
    progressHistory.current = { lastLoaded: 0, lastTime: Date.now() };

    try {
      const urlResponse = await API.get('/videos/get-upload-url');
      const uploadUrl = urlResponse.data.url;
      if (!uploadUrl) throw new Error('Could not get an upload URL.');

      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const currentTime = Date.now();
          const timeElapsed = (currentTime - progressHistory.current.lastTime) / 1000;

          if (timeElapsed > 0.5) {
            const speedBps = (loaded - progressHistory.current.lastLoaded) / timeElapsed;
            setUploadSpeed(speedBps / (1024 * 1024));
            setTimeRemaining((total - loaded) / speedBps);
            progressHistory.current = { lastLoaded: loaded, lastTime: currentTime };
          }
          setProgress(Math.round((loaded * 100) / total));
        },
      });

      const streamtapeFileId = uploadResponse.data.result.id;
      if (!streamtapeFileId) throw new Error('File ID not found after upload.');

      await API.post('/videos/save-video-metadata', { title, description, streamtapeFileId });
      toast.success('Video uploaded successfully!');
      navigate('/dashboard');

    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoteUpload = async ({ url, title, description }) => { // <-- Receives all fields
    setIsUploading(true);
    // Send all fields to the backend
    const promise = API.post('/videos/remote-upload', { url, title, description });

    toast.promise(promise, {
      loading: 'Initiating and tracking remote upload...',
      success: (res) => {
        navigate('/dashboard'); 
        return res.data.msg || 'Remote upload started!';
      },
      error: (err) => err.response?.data?.msg || 'Failed to start remote upload.',
    });

    try {
        await promise;
    } catch (error) {
        // Toast handles the error
    } finally {
        setIsUploading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload a New Video</h2>
      
      {isUploading && activeTab === 'local' ? (
        <ProgressIndicator progress={progress} uploadSpeed={uploadSpeed} timeRemaining={timeRemaining} fileName={fileName} />
      ) : (
        <>
          <div className="flex border-b mb-6">
            <button onClick={() => setActiveTab('local')} className={`py-2 px-4 -mb-px font-semibold ${activeTab === 'local' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>
              Local Upload
            </button>
            <button onClick={() => setActiveTab('remote')} className={`py-2 px-4 -mb-px font-semibold ${activeTab === 'remote' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-500'}`}>
              Remote Upload
            </button>
          </div>
          
          {activeTab === 'local' ? (
            <LocalUploadForm onUpload={handleLocalUpload} isUploading={isUploading} />
          ) : (
            <RemoteUploadForm onUpload={handleRemoteUpload} isUploading={isUploading} />
          )}
        </>
      )}
    </div>
  );
}

export default UploadPage;