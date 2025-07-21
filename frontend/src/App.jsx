import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useAuthStore from "./store/authStore";
import API from "./services/api";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FilesPage from "./pages/FilesPage";

function App() {
  const { setUser, logout, stopLoading } = useAuthStore();

  useEffect(() => {
    // This effect runs only once when the app component mounts
    const checkUserSession = async () => {
      try {
        // Always try to fetch the user from the backend
        const response = await API.get("/auth/me");
        // If successful, a valid session exists. Update the store.
        setUser(response.data);
      } catch (error) {
        // If the request fails (e.g., 401 Unauthorized), it means no valid session.
        // Ensure the frontend state is logged out.
        logout();
      } finally {
        // In either case, we're done loading the session info.
        stopLoading();
      }
    };

    checkUserSession();
    // The empty dependency array [] ensures this runs only once on mount.
  }, [setUser, logout, stopLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files/:folderId?" // The '?' makes the folderId optional
            element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
