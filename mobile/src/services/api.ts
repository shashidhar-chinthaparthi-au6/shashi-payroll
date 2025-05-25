import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's IP address here
const API_URL = 'https://payroll-server-ne8y.onrender.com/api'; // Updated production API URL
// const API_URL = 'http://192.168.0.101:5000/api'   // Updated production API URL

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
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred while changing password';
      throw new Error(errorMessage);
    }
  },
};

export const attendanceAPI = {
  checkIn: async (userId: string) => {
    console.log('Sending check-in request:', { userId });
    try {
      const response = await api.post('/attendance/check-in', { userId });
      console.log('Check-in response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in checkIn:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check in';
      throw new Error(`Error checking in: ${errorMessage}`);
    }
  },
  checkOut: async (userId: string) => {
    console.log('Sending check-out request:', { userId });
    try {
      const response = await api.post('/attendance/check-out', { userId });
      console.log('Check-out response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in checkOut:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check out';
      throw new Error(`Error checking out: ${errorMessage}`);
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
  requestLeave: async (leaveData: any) => {
    const response = await api.post('/leave/request', leaveData);
    return response.data;
  },
  getLeaveHistory: async (userId: string, month?: number, year?: number) => {
    const params = month && year ? { month, year } : {};
    const response = await api.get(`/leave/history/${userId}`, { params });
    return response.data;
  },
  getLeaveBalance: async () => {
    const response = await api.get('/leave/balance');
    return response.data;
  }
};

export const profileAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/employees/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.patch('/employees/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
  getDocuments: async () => {
    try {
      const response = await api.get('/employees/documents');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  },
  uploadDocument: async (formData: FormData, type: string) => {
    try {
      const response = await api.post('/employees/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          // Don't transform FormData
          if (data instanceof FormData) {
            return data;
          }
          return data;
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log('Upload progress:', percentCompleted);
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading document:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },
  downloadDocument: async (documentId: string) => {
    try {
      const response = await api.get(`/employees/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading document:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to download document');
    }
  },
  getSettings: async () => {
    try {
      const response = await api.get('/employees/settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching settings:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  },
  updateSettings: async (settings: any) => {
    try {
      const response = await api.patch('/employees/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('Error updating settings:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }
};

export default api; 