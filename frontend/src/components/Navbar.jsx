import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import API from "../services/api";
import { toast } from "react-hot-toast";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = async () => {
    const promise = API.post("/auth/logout");

    toast.promise(promise, {
      loading: "Logging out...",
      success: () => {
        logout();
        navigate("/login");
        return "Logged out successfully!";
      },
      error: () => {
        // Still log out on the frontend even if the server call fails
        logout();
        navigate("/login");
        return "Could not log out properly, but you have been logged out on this device.";
      },
    });
  };

  const authLinks = (
    <ul className="flex items-center space-x-4">
        <li>
            <Link to="/files" className="font-semibold text-gray-700 hover:text-blue-500">
                My Files
            </Link>
        </li>
      <li>
        <Link
          to="/dashboard"
          className="font-semibold text-gray-700 hover:text-blue-500"
        >
          Hello, {user?.name || user?.email}
        </Link>
      </li>
      <li>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm"
        >
          Logout
        </button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="flex items-center space-x-4">
      <li>
        <Link
          to="/register"
          className="text-gray-700 hover:text-blue-500 font-medium"
        >
          Register
        </Link>
      </li>
      <li>
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm"
        >
          Login
        </Link>
      </li>
    </ul>
  );

  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">
        <Link to="/">AuraHub</Link>
      </h1>
      <div>{isAuthenticated ? authLinks : guestLinks}</div>
    </nav>
  );
}

export default Navbar;
