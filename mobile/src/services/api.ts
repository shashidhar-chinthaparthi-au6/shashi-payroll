import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's IP address here
// const API_URL = 'https://payroll-server-ne8y.onrender.com/api'; // Updated production API URL
const API_URL = 'http://192.168.0.101:5000/api'   // Updated production API URL

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
  markAttendance: async (userId: string) => {
    console.log('Sending manual attendance request:', { userId });
    try {
      const response = await api.post('/attendance/check-in', { userId });
      console.log('Manual attendance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in markAttendance:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark attendance';
      throw new Error(`Error marking attendance: ${errorMessage}`);
    }
  },
  getAttendanceHistory: async () => {
    const response = await api.get('/attendance/user');
    console.log('Attendance history response:', response.data);
    return response.data;
  },
  getMonthlySummary: async (userId: string, month: number, year: number) => {
    try {
      const response = await api.get(`/attendance/monthly-summary/${userId}`, {
        params: { month, year }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getMonthlySummary:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly summary');
    }
  },
  getDetailedHistory: async (userId: string, startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/attendance/history/${userId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getDetailedHistory:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance history');
    }
  }
};

export const payslipAPI = {
  getPayslips: async () => {
    try {
      const response = await api.get('/payslips/employee/me');
      console.log('Payslips response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payslips:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch payslips');
    }
  },
  getPayslipsByUserId: async (userId: string) => {
    try {
      const response = await api.get(`/payslips/employee/${userId}`);
      console.log('Payslips response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payslips:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch payslips');
    }
  },
  getPayslipById: async (id: string) => {
    try {
      const response = await api.get(`/payslips/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payslip details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch payslip details');
    }
  },
  downloadPayslip: async (id: string) => {
    try {
      const response = await api.get(`/payslips/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading payslip:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to download payslip');
    }
  }
};

export const shopAPI = {
  getShops: async () => {
    const response = await api.get('/shops/my-shops');
    return response.data;
  },
};

export const getDashboardData = async (userId: string) => {
  const response = await api.get(`/home/dashboard/${userId}`);
  return response.data;
};

export const leaveAPI = {
  requestLeave: async (leaveData: any, token: string) => {
    const res = await axios.post(`${API_URL}/leave/request`, leaveData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  getLeaveHistory: async (userId: string, token: string, month?: number, year?: number) => {
    const params = month && year ? { month, year } : {};
    const res = await axios.get(`${API_URL}/leave/history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },
  getLeaveBalance: async (userId: string, token: string) => {
    const res = await axios.get(`${API_URL}/leave/balance/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};

export default api; 