import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenExpiry: number | null;
}

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  let user = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }

  // Check if token is expired
  const isExpired = tokenExpiry && parseInt(tokenExpiry) < Date.now();
  if (isExpired) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      tokenExpiry: null
    };
  }

  return {
    user,
    token,
    isAuthenticated: !!(token && user),
    loading: false,
    error: null,
    tokenExpiry: tokenExpiry ? parseInt(tokenExpiry) : null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Set token expiry to 1 hour from now
      const expiryTime = Date.now() + 60 * 60 * 1000;
      state.tokenExpiry = expiryTime;
      
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiry = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    },
    refreshToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      const expiryTime = Date.now() + 60 * 60 * 1000;
      state.tokenExpiry = expiryTime;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer; 