import axios from 'axios';
import constants from '../utils/config';

const API = axios.create({
  baseURL: `${constants.BACKEND_URL}/api`, // Your Node.js backend URL
  withCredentials: true, // Important for sending session cookies
});

export default API;