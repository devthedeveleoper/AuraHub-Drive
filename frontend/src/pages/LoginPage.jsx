import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    const promise = API.post('/auth/login', { email, password });

    toast.promise(promise, {
      loading: 'Logging in...',
      success: (res) => {
        setUser(res.data); // Update state with user data from response
        navigate('/dashboard'); // Redirect to the dashboard
        return `Welcome back, ${res.data.name || res.data.email}!`;
      },
      error: (err) => err.response?.data?.msg || 'Login failed. Please check your credentials.',
    });
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="text-center mb-4">
        <a href="http://localhost:5000/api/auth/github">
          <button
            type="button"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Login with GitHub
          </button>
        </a>
        <p className="my-3 text-sm text-gray-500 font-semibold">OR</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="email"
            type="email"
            placeholder="you@example.com"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password"
            type="password"
            placeholder="******************"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300"
            type="submit"
          >
            Sign In
          </button>
        </div>
         <p className="text-center text-gray-500 text-xs mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-500 hover:text-blue-800">
                Register here.
            </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;