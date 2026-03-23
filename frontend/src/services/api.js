import axios from 'axios';

// Get base URL from env, fallback to localhost for current DEV setup
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a global interceptor logic to dynamically fetch Clerk token
// Note: You must initialize this in App.jsx or main.jsx using setApiTokenGetter
let getTokenFn = null;

export const setApiTokenGetter = (fn) => {
  getTokenFn = fn;
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      try {
        const token = await getTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error attaching Clerk token to request:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (response.config?.responseType === 'blob') {
      return response;
    }

    return response.data; // Only return the actual data object
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // e.g. token expired or Invalid
        console.error('Unauthorized access. Redirect or notify user.');
      }
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
