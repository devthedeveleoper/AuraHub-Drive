import React from 'react';
import useAuthStore from '../store/authStore';

function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div>
      <h1>Welcome to AuraHub</h1>
      {isAuthenticated ? (
        <p>You are logged in as {user.name}.</p>
      ) : (
        <p>Please log in or register to upload videos.</p>
      )}
    </div>
  );
}

export default HomePage;