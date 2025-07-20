import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-hot-toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const navigate = useNavigate();

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
    }

    const promise = API.post('/auth/register', { name, email, password, password2 });

    toast.promise(promise, {
      loading: 'Creating your account...',
      success: (res) => {
        navigate('/login'); // Redirect to login page on success
        return res.data.msg || 'Registration successful! Please log in.';
      },
      error: (err) => err.response?.data?.msg || 'Registration failed. Please try again.',
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
            Register with GitHub
          </button>
        </a>
        <p className="my-3 text-sm text-gray-500 font-semibold">OR</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="name"
            type="text"
            placeholder="John Doe"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
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
        <div className="mb-4">
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
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
            Confirm Password
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password2"
            type="password"
            placeholder="******************"
            name="password2"
            value={password2}
            onChange={onChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300"
            type="submit"
          >
            Register with Email
          </button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-500 hover:text-blue-800">
            Login here.
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;