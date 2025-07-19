import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import API from '../services/api';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = async () => {
    await API.post('/auth/logout'); // Call the backend logout endpoint
    logout(); // Clear the state in the frontend
    navigate('/login');
  };

  const authLinks = (
    <ul>
      <li>Hello, {user?.name}</li>
      <li>
        <button onClick={onLogout}>Logout</button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav>
      <h1>
        <Link to="/">AuraHub</Link>
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
}

export default Navbar;