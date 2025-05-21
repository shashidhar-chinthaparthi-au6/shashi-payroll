import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.101:5000/api'; // Use your Mac's local IP for mobile access

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};

export const attendanceAPI = {
  markAttendance: async ({ employeeId, shopId }: { employeeId: string; shopId: string }) => {
    console.log('Sending manual attendance request:', { employeeId, shopId });
    try {
      const response = await api.post('/attendance/check-in', { employeeId, shopId });
      console.log('Manual attendance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in markAttendance:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark attendance';
      throw new Error(`Error marking attendance: ${errorMessage}`);
    }
  },
  getAttendanceHistory: async () => {
    const response = await api.get('/attendance/employee');
    console.log('Attendance history response:', response.data);
    return response.data;
  },
};

export const payslipAPI = {
  getPayslips: async () => {
    const response = await api.get('/payslips/employee/me');
    console.log('Payslips response:', response.data);
    return response.data;
  },
  getPayslipById: async (id: string) => {
    const response = await api.get(`/payslips/${id}`);
    return response.data;
  },
};

export const shopAPI = {
  getShops: async () => {
    const response = await api.get('/shops/my-shops');
    return response.data;
  },
};

export default api; 