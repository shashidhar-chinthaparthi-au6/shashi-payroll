import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import { authAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load initial state from AsyncStorage
const loadInitialState = async (): Promise<AuthState> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    let user = null;
    
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from AsyncStorage:', e);
      }
    }

    return {
      user,
      token,
      loading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error loading initial state:', error);
    return {
      user: null,
      token: null,
      loading: false,
      error: null,
    };
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    return await loadInitialState();
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await authAPI.login(email, password);
    // First update the Redux store
    const result = {
      user: response.data.user,
      token: response.data.token,
    };
    // Then save to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem('token', response.data.token),
      AsyncStorage.setItem('user', JSON.stringify(response.data.user))
    ]);
    return result;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await authAPI.logout();
  } catch (error) {
    console.error('Error during logout:', error);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer; 