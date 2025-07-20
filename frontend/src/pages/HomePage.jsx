import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="bg-gray-50 flex flex-col items-center justify-center text-center p-10 rounded-lg">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
          Welcome to AuraHub
        </h1>
        <p className="text-lg text-gray-600">
          Your modern and seamless video streaming platform.
        </p>
      </header>

      <div className="max-w-xl">
        {isAuthenticated ? (
          // View for logged-in users
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              You're all set, {user?.name || user?.email}!
            </h2>
            <p className="text-gray-700 mb-6">
              You can now manage your account or start uploading your videos.
            </p>
            <Link
              to="/dashboard"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          // View for guests
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Get Started
            </h2>
            <p className="text-gray-700 mb-6">
              Join our community today. Create an account or log in to start sharing and discovering amazing video content.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;