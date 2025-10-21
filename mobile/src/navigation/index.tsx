import React from 'react';
// Force TypeScript reload
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import OrganizationManagement from '../screens/admin/OrganizationManagement';
import ContractManagement from '../screens/admin/ContractManagement';
import AdminContractorManagement from '../screens/admin/ContractorManagement';
import GlobalAnalytics from '../screens/admin/GlobalAnalytics';
import SystemSettings from '../screens/admin/SystemSettings';
import PendingApprovals from '../screens/admin/PendingApprovals';
import SystemHealth from '../screens/admin/SystemHealth';
import AdvancedReporting from '../screens/admin/AdvancedReporting';
import SystemMonitoring from '../screens/admin/SystemMonitoring';
import AdminReportingPage from '../screens/admin/AdminReporting';

// Client Screens
import ClientDashboard from '../screens/client/ClientDashboard';
import EmployeeManagement from '../screens/client/EmployeeManagement';
import ClientContractorManagement from '../screens/client/ContractorManagement';
import AttendanceManagement from '../screens/client/AttendanceManagement';
import PayrollProcessing from '../screens/client/PayrollProcessing';
import LeaveManagement from '../screens/client/LeaveManagement';
import OrganizationReports from '../screens/client/OrganizationReports';
import ClientSettings from '../screens/client/ClientSettings';

// Employee Screens
import EmployeeDashboard from '../screens/employee/EmployeeDashboard';
import EmployeeAttendance from '../screens/employee/EmployeeAttendance';
import MarkAttendance from '../screens/employee/MarkAttendance';
import EmployeePayslips from '../screens/employee/EmployeePayslips';
import ApplyLeave from '../screens/employee/ApplyLeave';
import EmployeeProfile from '../screens/employee/EmployeeProfile';
import EmployeeAttendanceHistory from '../screens/employee/EmployeeAttendanceHistory';
import EmployeeLeaves from '../screens/employee/EmployeeLeaves';
import EmployeeSettings from '../screens/employee/EmployeeSettings';

// Contractor Screens
import ContractorDashboard from '../screens/contractor/ContractorDashboard';
import ContractorAttendance from '../screens/contractor/ContractorAttendance';
import ContractorMarkAttendance from '../screens/contractor/ContractorMarkAttendance';
import ViewInvoices from '../screens/contractor/ViewInvoices';
import ContractorApplyLeave from '../screens/contractor/ContractorApplyLeave';
import ContractorProfile from '../screens/contractor/ContractorProfile';
import ContractorHistory from '../screens/contractor/ContractorHistory';
import ContractorPayments from '../screens/contractor/ContractorPayments';
import ContractorReports from '../screens/contractor/ContractorReports';
import ContractorSettings from '../screens/contractor/ContractorSettings';

// Common Screens
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Admin Tab Navigator
const AdminTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagement}
        options={{ 
          title: 'Users',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="OrganizationManagement" 
        component={OrganizationManagement}
        options={{ 
          title: 'Organizations',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="office-building" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="SystemSettings" 
        component={SystemSettings}
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

// Client Tab Navigator
const ClientTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Tab.Screen 
        name="ClientDashboard" 
        component={ClientDashboard}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="EmployeeManagement" 
        component={EmployeeManagement}
        options={{ 
          title: 'Employees',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="AttendanceManagement" 
        component={AttendanceManagement}
        options={{ 
          title: 'Attendance',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clock" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="PayrollProcessing" 
        component={PayrollProcessing}
        options={{ 
          title: 'Payroll',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cash" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

// Employee Tab Navigator
const EmployeeTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Tab.Screen 
        name="EmployeeDashboard" 
        component={EmployeeDashboard}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="EmployeeAttendance" 
        component={EmployeeAttendance}
        options={{ 
          title: 'Attendance',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clock" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="EmployeePayslips" 
        component={EmployeePayslips}
        options={{ 
          title: 'Payslips',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="EmployeeProfile" 
        component={EmployeeProfile}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

// Contractor Tab Navigator
const ContractorTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Tab.Screen 
        name="ContractorDashboard" 
        component={ContractorDashboard}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="ContractorAttendance" 
        component={ContractorAttendance}
        options={{ 
          title: 'Attendance',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clock" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="ViewInvoices" 
        component={ViewInvoices}
        options={{ 
          title: 'Invoices',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document" color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="ContractorProfile" 
        component={ContractorProfile}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  console.log('🧭 Navigation - Auth State:', { isAuthenticated, user: user?.email, role: user?.role });

  if (!isAuthenticated || !user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Role-based navigation
  switch (user.role) {
    case 'admin':
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
          <Stack.Screen name="UserManagement" component={UserManagement} />
          <Stack.Screen name="OrganizationManagement" component={OrganizationManagement} />
          <Stack.Screen name="ContractManagement" component={ContractManagement} />
          <Stack.Screen name="ContractorManagement" component={AdminContractorManagement} />
          <Stack.Screen name="GlobalAnalytics" component={GlobalAnalytics} />
          <Stack.Screen name="SystemSettings" component={SystemSettings} />
          <Stack.Screen name="PendingApprovals" component={PendingApprovals} />
          <Stack.Screen name="SystemHealth" component={SystemHealth} />
          <Stack.Screen name="AdvancedReporting" component={AdvancedReporting} />
          <Stack.Screen name="SystemMonitoring" component={SystemMonitoring} />
          <Stack.Screen name="AdminReporting" component={AdminReportingPage} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      );

    case 'client':
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
          <Stack.Screen name="EmployeeManagement" component={EmployeeManagement} />
          <Stack.Screen name="ContractorManagement" component={ClientContractorManagement} />
          <Stack.Screen name="AttendanceManagement" component={AttendanceManagement} />
          <Stack.Screen name="PayrollProcessing" component={PayrollProcessing} />
          <Stack.Screen name="LeaveManagement" component={LeaveManagement} />
          <Stack.Screen name="OrganizationReports" component={OrganizationReports} />
          <Stack.Screen name="ClientSettings" component={ClientSettings} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      );

    case 'employee':
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EmployeeTabs" component={EmployeeTabNavigator} />
          <Stack.Screen name="EmployeeAttendance" component={EmployeeAttendance} />
          <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
          <Stack.Screen name="EmployeePayslips" component={EmployeePayslips} />
          <Stack.Screen name="ApplyLeave" component={ApplyLeave} />
          <Stack.Screen name="EmployeeProfile" component={EmployeeProfile} />
          <Stack.Screen name="EmployeeAttendanceHistory" component={EmployeeAttendanceHistory} />
          <Stack.Screen name="EmployeeLeaves" component={EmployeeLeaves} />
          <Stack.Screen name="EmployeeSettings" component={EmployeeSettings} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      );

    case 'contractor':
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ContractorTabs" component={ContractorTabNavigator} />
          <Stack.Screen name="ContractorAttendance" component={ContractorAttendance} />
          <Stack.Screen name="ContractorMarkAttendance" component={ContractorMarkAttendance} />
          <Stack.Screen name="ViewInvoices" component={ViewInvoices} />
          <Stack.Screen name="ContractorApplyLeave" component={ContractorApplyLeave} />
          <Stack.Screen name="ContractorProfile" component={ContractorProfile} />
          <Stack.Screen name="ContractorHistory" component={ContractorHistory} />
          <Stack.Screen name="ContractorPayments" component={ContractorPayments} />
          <Stack.Screen name="ContractorReports" component={ContractorReports} />
          <Stack.Screen name="ContractorSettings" component={ContractorSettings} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      );

    default:
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      );
  }
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
}
