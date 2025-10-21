import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';
import STATUS from '../constants/statusCodes';
import MSG from '../constants/messages';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { mockLogin, mockGetProfile, mockDashboardData } from './mockAuth';

const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator localhost

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Log API configuration on startup
console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  headers: api.defaults.headers,
  timeout: api.defaults.timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log detailed request information
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
        timeout: config.timeout
      });
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Success:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      baseURL: response.config.baseURL,
      fullURL: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      responseTime: Date.now()
    });
    return response;
  },
  async (error) => {
    console.log('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      data: error.response?.data,
      headers: error.response?.headers,
      networkError: !error.response,
      timeout: error.code === 'ECONNABORTED'
    });

    if (error.response?.status === 401) {
      console.log('🔐 Authentication Error - Clearing tokens');
      // Token expired or invalid, clear storage and redirect to login
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        console.log('✅ Storage cleared successfully');
        // Dispatch logout action to update Redux state
        store.dispatch(logout());
      } catch (storageError) {
        console.log('❌ Error clearing storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Generic API call function
const apiCall = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api({
      method,
      url: endpoint,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
    });

    return {
      status: response.status,
      data: response.data.data || response.data,
      message: response.data.message || 'Success',
    };
  } catch (error: any) {
    console.log('❌ API Call Error:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION APIs ====================
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await apiCall('POST', '/auth/login', credentials);
    } catch (error) {
      console.log('🔄 Server unavailable, using mock authentication');
      return await mockLogin(credentials.email, credentials.password);
    }
  },
  
  register: (userData: any) =>
    apiCall('POST', '/auth/register', userData),
  
  logout: () =>
    apiCall('POST', '/auth/logout'),
  
  refreshToken: () =>
    apiCall('POST', '/auth/refresh'),
  
  forgotPassword: (email: string) =>
    apiCall('POST', '/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiCall('POST', '/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiCall('POST', '/auth/change-password', { currentPassword, newPassword }),
  
  updateProfile: (profileData: any) =>
    apiCall('PUT', '/auth/profile', profileData),
  
  getProfile: async () => {
    try {
      return await apiCall('GET', '/auth/profile');
    } catch (error) {
      console.log('🔄 Server unavailable, using mock profile');
      return await mockGetProfile();
    }
  },
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      return await apiCall('GET', '/admin/dashboard');
    } catch (error) {
      console.log('🔄 Server unavailable, using mock admin dashboard data');
      return {
        status: 200,
        data: mockDashboardData.admin,
        message: 'Mock dashboard data'
      };
    }
  },
  
  getAnalytics: () =>
    apiCall('GET', '/admin/analytics'),
  
  getGlobalAnalytics: () =>
    apiCall('GET', '/admin/global-analytics'),
  
  // User Management
  getUsers: () =>
    apiCall('GET', '/admin/users'),
  
  createUser: (userData: any) =>
    apiCall('POST', '/admin/users', userData),
  
  updateUser: (id: string, userData: any) =>
    apiCall('PUT', `/admin/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    apiCall('DELETE', `/admin/users/${id}`),
  
  // Organization Management
  getOrganizations: () =>
    apiCall('GET', '/admin/organizations'),
  
  createOrganization: (orgData: any) =>
    apiCall('POST', '/admin/organizations', orgData),
  
  updateOrganization: (id: string, orgData: any) =>
    apiCall('PUT', `/admin/organizations/${id}`, orgData),
  
  deleteOrganization: (id: string) =>
    apiCall('DELETE', `/admin/organizations/${id}`),
  
  // Contract Management
  getContracts: () =>
    apiCall('GET', '/admin/contracts'),
  
  createContract: (contractData: any) =>
    apiCall('POST', '/admin/contracts', contractData),
  
  updateContract: (id: string, contractData: any) =>
    apiCall('PUT', `/admin/contracts/${id}`, contractData),
  
  deleteContract: (id: string) =>
    apiCall('DELETE', `/admin/contracts/${id}`),
  
  // Contractor Management
  getContractors: () =>
    apiCall('GET', '/admin/contractors'),
  
  createContractor: (contractorData: any) =>
    apiCall('POST', '/admin/contractors', contractorData),
  
  updateContractor: (id: string, contractorData: any) =>
    apiCall('PUT', `/admin/contractors/${id}`, contractorData),
  
  deleteContractor: (id: string) =>
    apiCall('DELETE', `/admin/contractors/${id}`),
  
  getContractorStats: () =>
    apiCall('GET', '/admin/contractor-stats'),
  
  getContractorAssignments: () =>
    apiCall('GET', '/admin/contractor-assignments'),
  
  exportContractors: (format: string, filter?: any) =>
    apiCall('POST', '/admin/export-contractors', { format, filter }),
  
  // System Management
  getSystemSettings: () =>
    apiCall('GET', '/admin/settings'),
  
  updateSystemSettings: (settings: any) =>
    apiCall('PUT', '/admin/settings', settings),
  
  getSystemHealth: () =>
    apiCall('GET', '/admin/system-health'),
  
  getSystemMetrics: () =>
    apiCall('GET', '/admin/system-metrics'),
  
  getSystemAlerts: () =>
    apiCall('GET', '/admin/system-alerts'),
  
  resolveSystemAlert: (id: string) =>
    apiCall('PUT', `/admin/system-alerts/${id}/resolve`),
  
  getPerformanceLogs: () =>
    apiCall('GET', '/admin/performance-logs'),
  
  getSecurityEvents: () =>
    apiCall('GET', '/admin/security-events'),
  
  exportLogs: (type: string, format: string) =>
    apiCall('POST', '/admin/export-logs', { type, format }),
  
  // Activities and Reports
  getActivities: () =>
    apiCall('GET', '/admin/activities'),
  
  getPendingApprovals: () =>
    apiCall('GET', '/admin/pending-approvals'),
  
  getAdvancedReports: (period: string, organization?: string) =>
    apiCall('POST', '/admin/advanced-reports', { period, organization }),
  
  exportReport: (format: string, period: string, organization?: string, reportType?: string) =>
    apiCall('POST', '/admin/export-report', { format, period, organization, reportType }),
};

// ==================== CLIENT APIs ====================
export const clientAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      return await apiCall('GET', '/client/dashboard');
    } catch (error) {
      console.log('🔄 Server unavailable, using mock client dashboard data');
      return {
        status: 200,
        data: mockDashboardData.client,
        message: 'Mock dashboard data'
      };
    }
  },
  
  getActivities: () =>
    apiCall('GET', '/client/activities'),
  
  // Employee Management
  getEmployees: () =>
    apiCall('GET', '/client/employees'),
  
  createEmployee: (employeeData: any) =>
    apiCall('POST', '/client/employees', employeeData),
  
  updateEmployee: (id: string, employeeData: any) =>
    apiCall('PUT', `/client/employees/${id}`, employeeData),
  
  deleteEmployee: (id: string) =>
    apiCall('DELETE', `/client/employees/${id}`),
  
  getEmployeeDetails: (id: string) =>
    apiCall('GET', `/client/employees/${id}`),
  
  // Contractor Management
  getContractors: () =>
    apiCall('GET', '/client/contractors'),
  
  createContractor: (contractorData: any) =>
    apiCall('POST', '/client/contractors', contractorData),
  
  updateContractor: (id: string, contractorData: any) =>
    apiCall('PUT', `/client/contractors/${id}`, contractorData),
  
  deleteContractor: (id: string) =>
    apiCall('DELETE', `/client/contractors/${id}`),
  
  getContractorDetails: (id: string) =>
    apiCall('GET', `/client/contractors/${id}`),
  
  // Attendance Management
  getAttendance: (filters?: any) =>
    apiCall('GET', '/client/attendance', filters),
  
  markAttendance: (attendanceData: any) =>
    apiCall('POST', '/client/attendance', attendanceData),
  
  updateAttendance: (id: string, attendanceData: any) =>
    apiCall('PUT', `/client/attendance/${id}`, attendanceData),
  
  getAttendanceReports: (filters?: any) =>
    apiCall('GET', '/client/attendance/reports', filters),
  
  exportAttendance: (format: string, filters?: any) =>
    apiCall('POST', '/client/attendance/export', { format, filters }),
  
  // Payroll Management
  getPayroll: (filters?: any) =>
    apiCall('GET', '/client/payroll', filters),
  
  processPayroll: (payrollData: any) =>
    apiCall('POST', '/client/payroll/process', payrollData),
  
  updatePayroll: (id: string, payrollData: any) =>
    apiCall('PUT', `/client/payroll/${id}`, payrollData),
  
  approvePayroll: (id: string) =>
    apiCall('PUT', `/client/payroll/${id}/approve`),
  
  rejectPayroll: (id: string, reason?: string) =>
    apiCall('PUT', `/client/payroll/${id}/reject`, { reason }),
  
  getPayrollReports: (filters?: any) =>
    apiCall('GET', '/client/payroll/reports', filters),
  
  exportPayroll: (format: string, filters?: any) =>
    apiCall('POST', '/client/payroll/export', { format, filters }),
  
  // Leave Management
  getLeaves: (filters?: any) =>
    apiCall('GET', '/client/leaves', filters),
  
  approveLeave: (id: string) =>
    apiCall('PUT', `/client/leaves/${id}/approve`),
  
  rejectLeave: (id: string, reason?: string) =>
    apiCall('PUT', `/client/leaves/${id}/reject`, { reason }),
  
  getLeaveReports: (filters?: any) =>
    apiCall('GET', '/client/leaves/reports', filters),
  
  exportLeaves: (format: string, filters?: any) =>
    apiCall('POST', '/client/leaves/export', { format, filters }),
  
  // Reports and Analytics
  getReports: (filters?: any) =>
    apiCall('GET', '/client/reports', filters),
  
  generateReport: (reportData: any) =>
    apiCall('POST', '/client/reports', reportData),
  
  exportReport: (format: string, reportData: any) =>
    apiCall('POST', '/client/reports/export', { format, ...reportData }),
  
  getAnalytics: () =>
    apiCall('GET', '/client/analytics'),
  
  // Settings
  getSettings: () =>
    apiCall('GET', '/client/settings'),
  
  updateSettings: (settings: any) =>
    apiCall('PUT', '/client/settings', settings),
};

// ==================== EMPLOYEE APIs ====================
export const employeeAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      return await apiCall('GET', '/employee/dashboard');
    } catch (error) {
      console.log('🔄 Server unavailable, using mock employee dashboard data');
      return {
        status: 200,
        data: mockDashboardData.employee,
        message: 'Mock dashboard data'
      };
    }
  },
  
  // Profile
  getProfile: () =>
    apiCall('GET', '/employee/profile'),
  
  updateProfile: (profileData: any) =>
    apiCall('PUT', '/employee/profile', profileData),
  
  // Attendance
  getAttendanceHistory: (filters?: any) =>
    apiCall('GET', '/employee/attendance', filters),
  
  markAttendance: (attendanceData: any) =>
    apiCall('POST', '/employee/attendance', attendanceData),
  
  getAttendanceStats: () =>
    apiCall('GET', '/employee/attendance/stats'),
  
  // Leaves
  getLeaves: (filters?: any) =>
    apiCall('GET', '/employee/leaves', filters),
  
  applyLeave: (leaveData: any) =>
    apiCall('POST', '/employee/leaves', leaveData),
  
  updateLeave: (id: string, leaveData: any) =>
    apiCall('PUT', `/employee/leaves/${id}`, leaveData),
  
  cancelLeave: (id: string) =>
    apiCall('DELETE', `/employee/leaves/${id}`),
  
  getLeaveBalance: () =>
    apiCall('GET', '/employee/leaves/balance'),
  
  // Payslips
  getPayslips: (filters?: any) =>
    apiCall('GET', '/employee/payslips', filters),
  
  getPayslip: (id: string) =>
    apiCall('GET', `/employee/payslips/${id}`),
  
  downloadPayslip: (id: string) =>
    apiCall('GET', `/employee/payslips/${id}/download`),
  
  // Notifications
  getNotifications: () =>
    apiCall('GET', '/employee/notifications'),
  
  markNotificationRead: (id: string) =>
    apiCall('PUT', `/employee/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    apiCall('PUT', '/employee/notifications/read-all'),
  
  // Settings
  getSettings: () =>
    apiCall('GET', '/employee/settings'),
  
  updateSettings: (settings: any) =>
    apiCall('PUT', '/employee/settings', settings),
};

// ==================== CONTRACTOR APIs ====================
export const contractorAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      return await apiCall('GET', '/contractor/dashboard');
    } catch (error) {
      console.log('🔄 Server unavailable, using mock contractor dashboard data');
      return {
        status: 200,
        data: mockDashboardData.contractor,
        message: 'Mock dashboard data'
      };
    }
  },
  
  // Profile
  getProfile: () =>
    apiCall('GET', '/contractor/profile'),
  
  updateProfile: (profileData: any) =>
    apiCall('PUT', '/contractor/profile', profileData),
  
  // Attendance
  getAttendanceHistory: (filters?: any) =>
    apiCall('GET', '/contractor/attendance', filters),
  
  markAttendance: (attendanceData: any) =>
    apiCall('POST', '/contractor/attendance', attendanceData),
  
  getAttendanceStats: () =>
    apiCall('GET', '/contractor/attendance/stats'),
  
  // Invoices
  getInvoices: (filters?: any) =>
    apiCall('GET', '/contractor/invoices', filters),
  
  createInvoice: (invoiceData: any) =>
    apiCall('POST', '/contractor/invoices', invoiceData),
  
  updateInvoice: (id: string, invoiceData: any) =>
    apiCall('PUT', `/contractor/invoices/${id}`, invoiceData),
  
  deleteInvoice: (id: string) =>
    apiCall('DELETE', `/contractor/invoices/${id}`),
  
  getInvoice: (id: string) =>
    apiCall('GET', `/contractor/invoices/${id}`),
  
  downloadInvoice: (id: string) =>
    apiCall('GET', `/contractor/invoices/${id}/download`),
  
  // Contracts
  getContracts: (filters?: any) =>
    apiCall('GET', '/contractor/contracts', filters),
  
  getContract: (id: string) =>
    apiCall('GET', `/contractor/contracts/${id}`),
  
  // Notifications
  getNotifications: () =>
    apiCall('GET', '/contractor/notifications'),
  
  markNotificationRead: (id: string) =>
    apiCall('PUT', `/contractor/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    apiCall('PUT', '/contractor/notifications/read-all'),
  
  // Settings
  getSettings: () =>
    apiCall('GET', '/contractor/settings'),
  
  updateSettings: (settings: any) =>
    apiCall('PUT', '/contractor/settings', settings),
};

// ==================== SHARED APIs ====================
export const sharedAPI = {
  // File Upload
  uploadFile: (file: any, type: string) =>
    apiCall('POST', '/upload', { file, type }),
  
  // Notifications
  getNotifications: () =>
    apiCall('GET', '/notifications'),
  
  markNotificationRead: (id: string) =>
    apiCall('PUT', `/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    apiCall('PUT', '/notifications/read-all'),
  
  // Search
  search: (query: string, type?: string) =>
    apiCall('GET', '/search', { query, type }),
  
  // Help and Support
  getHelpArticles: () =>
    apiCall('GET', '/help/articles'),
  
  getHelpArticle: (id: string) =>
    apiCall('GET', `/help/articles/${id}`),
  
  submitSupportTicket: (ticketData: any) =>
    apiCall('POST', '/support/tickets', ticketData),
  
  getSupportTickets: () =>
    apiCall('GET', '/support/tickets'),
  
  getSupportTicket: (id: string) =>
    apiCall('GET', `/support/tickets/${id}`),
};

// Export the main API object
export default api;