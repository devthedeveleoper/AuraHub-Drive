import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import API from '../services/api';
import { toast } from 'react-hot-toast';

function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = async () => {
    const promise = API.post('/auth/logout');

    toast.promise(promise, {
      loading: 'Logging out...',
      success: () => {
        logout();
        navigate('/login');
        return 'Logged out successfully!';
      },
      error: () => {
        // Still log out on the frontend even if the server call fails
        logout();
        navigate('/login');
        return 'Could not log out properly, but you have been logged out on this device.';
      },
    });
  };

  if (!user) {
    // This can happen briefly while the user session is loading.
    return (
        <div className="text-center mt-10">
            <p>Loading user data...</p>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Dashboard</h2>

      {/* Conditional rendering based on whether the user has an avatar (from GitHub) */}
      {user.avatar ? (
        <div className="flex flex-col items-center text-center">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
          />
          <p className="text-xl font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-1 text-xs text-green-600 font-medium">(Logged in via GitHub)</p>
        </div>
      ) : (
        <div className="text-center">
          {/* Display a generic avatar for email users */}
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 border-4 border-gray-100">
             <span className="text-4xl text-gray-500">{user.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
          </div>
          <p className="text-xl font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-1 text-xs text-blue-600 font-medium">(Logged in via Email)</p>
        </div>
      )}

      <button
        onClick={onLogout}
        className="w-full mt-8 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  );
}

export default DashboardPage;