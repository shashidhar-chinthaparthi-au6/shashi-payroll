import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Drawer, Portal, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useUI } from '../contexts/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useUI();

  const handleLogout = () => {
    dispatch(logout() as any);
    showToast('Logged out successfully', 'success');
  };

  const menuItems = [
    { title: 'Dashboard', icon: 'view-dashboard', route: 'AdminDashboard' },
    { title: 'User Management', icon: 'account-group', route: 'UserManagement' },
    { title: 'Organizations', icon: 'office-building', route: 'OrganizationManagement' },
    { title: 'Contracts', icon: 'file-document', route: 'ContractManagement' },
    { title: 'Contractors', icon: 'account-hard-hat', route: 'ContractorManagement' },
    { title: 'Analytics', icon: 'chart-line', route: 'GlobalAnalytics' },
    { title: 'Settings', icon: 'cog', route: 'SystemSettings' },
    { title: 'Approvals', icon: 'check-circle', route: 'PendingApprovals' },
    { title: 'System Health', icon: 'heart-pulse', route: 'SystemHealth' },
    { title: 'Reports', icon: 'file-chart', route: 'AdvancedReporting' },
    { title: 'Monitoring', icon: 'monitor', route: 'SystemMonitoring' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title={title} titleStyle={{ color: theme.colors.onPrimary }} />
        <Appbar.Action 
          icon="bell" 
          onPress={() => {/* Handle notifications */}} 
          iconColor={theme.colors.onPrimary}
        />
        <Appbar.Action 
          icon="account-circle" 
          onPress={() => {/* Handle profile */}} 
          iconColor={theme.colors.onPrimary}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {children}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {/* Handle add action */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AdminLayout;
