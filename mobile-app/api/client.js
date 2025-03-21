import axios from 'axios';
import { API_URL } from '../config';

// Create an axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for handling common request processing
apiClient.interceptors.request.use(
  (config) => {
    // You can modify the request config here (e.g., add auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
apiClient.interceptors.response.use(
  (response) => {
    // You can process successful responses here
    return response;
  },
  (error) => {
    // You can handle errors globally here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient; 