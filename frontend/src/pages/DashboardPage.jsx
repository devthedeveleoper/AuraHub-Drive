import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const VideoList = ({ videos, onRemove, onCheckStatus }) => {
    if (videos.length === 0) {
        return <p className="text-center text-gray-500 mt-8">You haven't uploaded any videos yet.</p>;
    }

    return (
        <div className="mt-8 space-y-4">
            {videos.map((video) => (
                <div key={video._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-800">{video.title}</h4>
                        <p className="text-sm text-gray-600">{video.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {video.status === 'processing' ? (
                            <>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Processing</span>
                                {/* Re-introduce the manual check button */}
                                <button
                                    onClick={() => onCheckStatus(video.remoteUploadId)}
                                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                >
                                    Check Status
                                </button>
                                <button onClick={() => onRemove(video.remoteUploadId)} className="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded">Cancel</button>
                            </>
                        ) : (
                             <span className={`text-xs font-semibold px-2 py-1 rounded-full ${video.status === 'completed' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};


function DashboardPage() {
    const { user } = useAuthStore();
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await API.get('/videos/my-videos');
            setVideos(response.data);
        } catch (error) {
            toast.error('Could not fetch your videos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // This function is now triggered by the button click
    const handleCheckStatus = async (remoteUploadId) => {
        const promise = API.get(`/videos/remote-upload/status/${remoteUploadId}`);

        toast.promise(promise, {
            loading: 'Checking status...',
            success: (res) => {
                if (res.data.status !== 'processing') {
                    // If finished, refresh the whole list to show the new status
                    fetchVideos();
                    return `Upload is ${res.data.status}!`;
                }
                // If still processing, just inform the user
                return `Still processing...`;
            },
            error: (err) => err.response?.data?.msg || 'Could not get status.',
        });
    };

    const handleRemoveUpload = async (remoteUploadId) => {
        if (!window.confirm('Are you sure you want to cancel this remote upload?')) return;
        const toastId = toast.loading('Removing upload...');
        try {
            await API.delete(`/videos/remote-upload/remove/${remoteUploadId}`);
            toast.success('Upload removed successfully.', { id: toastId });
            // Refresh the list after removing
            fetchVideos();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not remove upload.', { id: toastId });
        }
    };

    // This effect runs only once when the component first loads
    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    if (isLoading) {
        return <p className="text-center mt-10">Loading videos...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome, {user?.name || user?.email}!</h2>
            <p className="text-gray-600 mb-6">Manage your uploaded content here.</p>
            
            <VideoList
                videos={videos}
                onRemove={handleRemoveUpload}
                onCheckStatus={handleCheckStatus}
            />
        </div>
    );
}

export default DashboardPage;