import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Node.js backend URL
  withCredentials: true, // Important for sending session cookies
});

export default API;