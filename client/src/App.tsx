import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import ContractorLayout from './layouts/ContractorLayout';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeePayslips from './pages/employee/EmployeePayslips';
import MarkAttendance from './pages/employee/MarkAttendance';
import ApplyLeave from './pages/employee/ApplyLeave';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorMarkAttendance from './pages/contractor/MarkAttendance';
import ContractorViewInvoices from './pages/contractor/ViewInvoices';
import ContractorApplyLeave from './pages/contractor/ApplyLeave';
import ContractorProfile from './pages/contractor/ContractorProfile';
import ContractorAttendance from './pages/contractor/ContractorAttendance';
import Profile from './pages/Profile';
import DevUsers from './pages/DevUsers';
import UserManagement from './pages/admin/UserManagement';
import OrganizationManagement from './pages/admin/OrganizationManagement';
import ContractManagement from './pages/admin/ContractManagement';
import AdminContractorManagement from './pages/admin/ContractorManagement';
import GlobalAnalytics from './pages/admin/GlobalAnalytics';
import SystemSettingsPage from './pages/admin/SystemSettings';
import PendingApprovals from './pages/admin/PendingApprovals';
import SystemHealth from './pages/admin/SystemHealth';
import AdvancedReporting from './pages/admin/AdvancedReporting';
import AdminReporting from './pages/admin/AdminReporting';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import EmployeeManagement from './pages/client/EmployeeManagement';
import ClientContractorManagement from './pages/client/ContractorManagement';
import AttendanceManagement from './pages/client/AttendanceManagement';
import PayrollProcessing from './pages/client/PayrollProcessing';
import LeaveManagement from './pages/client/LeaveManagement';
import OrganizationReports from './pages/client/OrganizationReports';
import ClientSettings from './pages/client/ClientSettings';
import EmployeeAttendanceHistory from './pages/employee/EmployeeAttendanceHistory';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeeSettings from './pages/employee/EmployeeSettings';
import ContractorHistory from './pages/contractor/ContractorHistory';
import ContractorPayments from './pages/contractor/ContractorPayments';
import ContractorReports from './pages/contractor/ContractorReports';
import ContractorSettings from './pages/contractor/ContractorSettings';
import { ThemeProvider } from './contexts/ThemeContext';
// NOTE: remove stray UIProvider imports; UI is provided by ThemeProvider now

// Import actual dashboard components
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

const Unauthorized = () => <div>Unauthorized Access</div>;

// Protected Route component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode | ((props: { user: any }) => React.ReactNode); 
  allowedRoles: string[] 
}> = ({
  children,
  allowedRoles,
}): React.ReactElement => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return typeof children === 'function' ? children({ user }) as React.ReactElement : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <OrganizationManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contracts"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <ContractManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contractors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminContractorManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <GlobalAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <SystemSettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <PendingApprovals />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/health"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <SystemHealth />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdvancedReporting />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reporting"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminReporting />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <SystemMonitoring />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Client Routes */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <ClientDashboard />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/employees"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <EmployeeManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/attendance"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <AttendanceManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/payroll"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <PayrollProcessing />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/employees"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <EmployeeManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/contractors"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <ClientContractorManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/attendance"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <AttendanceManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/payroll"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <PayrollProcessing />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/leaves"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <LeaveManagement />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/reports"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <OrganizationReports />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/settings"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout>
              <ClientSettings />
            </ClientLayout>
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeDashboard />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'client', 'employee']}>
            {({ user }) => {
              if (user.role === 'admin') return <AdminLayout><Profile /></AdminLayout>;
              if (user.role === 'client') return <ClientLayout><Profile /></ClientLayout>;
              if (user.role === 'employee') return <EmployeeLayout><Profile /></EmployeeLayout>;
              return <Navigate to="/unauthorized" />;
            }}
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeAttendance />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/payslips"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeePayslips />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/mark-attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <MarkAttendance />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/apply-leave"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <ApplyLeave />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeProfile />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance-history"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeAttendanceHistory />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeLeaves />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/settings"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeSettings />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />

      {/* Contractor Routes */}
      <Route
        path="/contractor"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorDashboard />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/mark-attendance"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorMarkAttendance />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/invoices"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorViewInvoices />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/apply-leave"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorApplyLeave />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/profile"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorProfile />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/attendance"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorAttendance />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/history"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorHistory />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/payments"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorPayments />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/reports"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorReports />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor/settings"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorLayout>
              <ContractorSettings />
            </ContractorLayout>
          </ProtectedRoute>
        }
      />

      {/* Development Users Route - No authentication required for development */}
      <Route
        path="/dev-users"
        element={<DevUsers />}
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
