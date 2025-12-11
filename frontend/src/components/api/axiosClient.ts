// src/api/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // base API URL
  withCredentials: true,                 // send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: response interceptor for handling 401 globally
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // e.g., redirect to login
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
