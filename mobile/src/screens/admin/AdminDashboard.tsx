import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Chip, IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { adminAPI } from '../../utils/api';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalContracts: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      showLoader(true);
      
      // Fetch comprehensive dashboard data from backend
      const [dashboardResponse, usersResponse, organizationsResponse, analyticsResponse, pendingResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        adminAPI.getOrganizations(),
        adminAPI.getAnalytics(),
        adminAPI.getPendingApprovals()
      ]);

      // Use dashboard data if available, otherwise calculate from individual responses
      const dashboardData = dashboardResponse.data || {};
      
      setStats({
        totalUsers: dashboardData.totalUsers || usersResponse.data?.length || 0,
        totalOrganizations: dashboardData.totalOrganizations || organizationsResponse.data?.length || 0,
        totalContracts: dashboardData.activeContracts || analyticsResponse.data?.totalContracts || 0,
        pendingApprovals: dashboardData.pendingApprovals || pendingResponse.data?.length || 0,
      });
    } catch (error) {
      console.log('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statHeader}>
          <IconButton icon={icon} size={24} iconColor={color} />
          <Title style={[styles.statValue, { color }]}>{value}</Title>
        </View>
        <Paragraph style={[styles.statTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  const QuickAction = ({ title, icon, onPress }: any) => (
    <Card 
      style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.actionContent}>
        <IconButton icon={icon} size={32} iconColor={theme.colors.primary} />
        <Paragraph style={[styles.actionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}>
          Welcome back, {user?.firstName}!
        </Title>
        <Paragraph style={[styles.welcomeSubtitle, { color: theme.colors.onSurface }]}>
          Here's what's happening with your system
        </Paragraph>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="account-group"
          color={theme.colors.primary}
        />
        <StatCard
          title="Organizations"
          value={stats.totalOrganizations}
          icon="office-building"
          color={theme.colors.secondary}
        />
        <StatCard
          title="Active Contracts"
          value={stats.totalContracts}
          icon="file-document"
          color={theme.colors.primary}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="clock-alert"
          color="#FF9800"
        />
      </View>

      <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Title>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Manage Users"
              icon="account-group"
              onPress={() => {/* Navigate to user management */}}
            />
            <QuickAction
              title="View Reports"
              icon="chart-line"
              onPress={() => {/* Navigate to reports */}}
            />
            <QuickAction
              title="System Health"
              icon="heart-pulse"
              onPress={() => {/* Navigate to system health */}}
            />
            <QuickAction
              title="Settings"
              icon="cog"
              onPress={() => {/* Navigate to settings */}}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.recentActivityCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recent Activity
          </Title>
          <View style={styles.activityList}>
            <View key="activity-1" style={styles.activityItem}>
              <Chip icon="account-plus" style={styles.activityChip}>
                New user registered
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                2 hours ago
              </Paragraph>
            </View>
            <View key="activity-2" style={styles.activityItem}>
              <Chip icon="file-document" style={styles.activityChip}>
                Contract approved
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                4 hours ago
              </Paragraph>
            </View>
            <View key="activity-3" style={styles.activityItem}>
              <Chip icon="alert" style={styles.activityChip}>
                System alert resolved
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                6 hours ago
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    elevation: 2,
  },
  statContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  quickActionsCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '48%',
    margin: '1%',
    elevation: 1,
  },
  actionContent: {
    alignItems: 'center',
    padding: 16,
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  recentActivityCard: {
    margin: 16,
    elevation: 2,
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityChip: {
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default AdminDashboard;
