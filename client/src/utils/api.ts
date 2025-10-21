import { API_URL } from '../config';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const api = async (endpoint: string, options: ApiOptions = {}) => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  // Check if token is expired
  if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
    store.dispatch(logout());
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    console.log('Making API request to:', `${API_URL}${endpoint}`);
    console.log('Request options:', { headers, method: options.method });

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (response.status === 401) {
      // Token expired or invalid
      console.error('401 Unauthorized - Token expired or invalid');
      console.error('Response data:', data);
      
      // Only auto-redirect in production, not during development
      if (process.env.NODE_ENV === 'production') {
        store.dispatch(logout());
        window.location.href = '/login';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      console.error('403 Forbidden - Access denied');
      console.error('Response data:', data);
      
      // Only auto-redirect in production, not during development
      if (process.env.NODE_ENV === 'production') {
        window.location.href = '/unauthorized';
      }
      
      throw new Error('Access denied');
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', {
      endpoint,
      error: error.message,
      response: error.response,
      status: error.status
    });
    throw error;
  }
};

export default api; 