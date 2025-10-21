import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, useTheme, Chip, IconButton, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { clientAPI } from '../../utils/api';

interface DashboardStats {
  totalEmployees: number;
  totalContractors: number;
  presentToday: number;
  pendingPayroll: number;
  pendingLeaves: number;
  activeContracts: number;
  monthlyPayroll: number;
  attendanceRate: number;
}

const ClientDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalContractors: 0,
    presentToday: 0,
    pendingPayroll: 0,
    pendingLeaves: 0,
    activeContracts: 0,
    monthlyPayroll: 0,
    attendanceRate: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      showLoader(true);
      
      const [dashboardResponse, employeesResponse, contractorsResponse, attendanceResponse, payrollResponse, leavesResponse] = await Promise.all([
        clientAPI.getDashboard(),
        clientAPI.getEmployees(),
        clientAPI.getContractors(),
        clientAPI.getAttendance({}),
        clientAPI.getPayroll({}),
        clientAPI.getLeaves({})
      ]);

      const dashboardData = dashboardResponse.data || {};
      const employees = employeesResponse.data || [];
      const contractors = contractorsResponse.data || [];
      const attendance = attendanceResponse.data || [];
      const payroll = payrollResponse.data || [];
      const leaves = leavesResponse.data || [];

      setStats({
        totalEmployees: dashboardData.totalEmployees || employees.length,
        totalContractors: dashboardData.totalContractors || contractors.length,
        presentToday: dashboardData.presentToday || attendance.filter((a: any) => a.status === 'present').length,
        pendingPayroll: dashboardData.pendingPayroll || payroll.filter((p: any) => p.status === 'pending').length,
        pendingLeaves: dashboardData.pendingLeaves || leaves.filter((l: any) => l.status === 'pending').length,
        activeContracts: dashboardData.activeContracts || contractors.filter((c: any) => c.status === 'active').length,
        monthlyPayroll: dashboardData.monthlyPayroll || 0,
        attendanceRate: dashboardData.attendanceRate || 0,
      });
    } catch (error) {
      console.log('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
          <Title style={[styles.statValue, { color: theme.colors.onSurface }]}>{value}</Title>
        </View>
        <Paragraph style={[styles.statTitle, { color: theme.colors.onSurface }]}>{title}</Paragraph>
        {subtitle && (
          <Paragraph style={[styles.statSubtitle, { color: theme.colors.onSurface }]}>{subtitle}</Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <Card style={[styles.quickActionCardInner, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.quickActionContent}>
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name={icon} size={32} color={color} />
          </View>
          <Title style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>{title}</Title>
          <Paragraph style={[styles.quickActionDescription, { color: theme.colors.onSurface }]}>
            {description}
          </Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>
          Welcome back, {user?.firstName || 'Client'}!
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Here's what's happening with your organization today
        </Paragraph>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon="account-group"
          color={theme.colors.primary}
        />
        <StatCard
          title="Contractors"
          value={stats.totalContractors}
          icon="briefcase"
          color={theme.colors.secondary}
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon="clock-check"
          color="#4CAF50"
        />
        <StatCard
          title="Pending Payroll"
          value={stats.pendingPayroll}
          icon="cash-clock"
          color="#FF9800"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon="calendar-clock"
          color="#F44336"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts}
          icon="file-document"
          color={theme.colors.primary}
        />
      </View>

      {/* Monthly Payroll Card */}
      <Card style={[styles.payrollCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Monthly Payroll</Title>
          <View style={styles.payrollContent}>
            <View style={styles.payrollAmount}>
              <Title style={[styles.payrollValue, { color: theme.colors.primary }]}>
                ₹{stats.monthlyPayroll.toLocaleString()}
              </Title>
              <Paragraph style={[styles.payrollLabel, { color: theme.colors.onSurface }]}>
                Total for this month
              </Paragraph>
            </View>
            <View style={styles.attendanceRate}>
              <Paragraph style={[styles.attendanceLabel, { color: theme.colors.onSurface }]}>
                Attendance Rate
              </Paragraph>
              <ProgressBar 
                progress={stats.attendanceRate / 100} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Paragraph style={[styles.attendanceValue, { color: theme.colors.onSurface }]}>
                {stats.attendanceRate}%
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Employee Management"
              description="Manage employees and their details"
              icon="account-group"
              color={theme.colors.primary}
              onPress={() => console.log('Navigate to Employee Management')}
            />
            <QuickActionCard
              title="Contractor Management"
              description="Manage contractors and assignments"
              icon="briefcase"
              color={theme.colors.secondary}
              onPress={() => console.log('Navigate to Contractor Management')}
            />
            <QuickActionCard
              title="Attendance Management"
              description="Track and manage attendance"
              icon="clock"
              color="#4CAF50"
              onPress={() => console.log('Navigate to Attendance Management')}
            />
            <QuickActionCard
              title="Payroll Processing"
              description="Process monthly payroll"
              icon="cash"
              color="#FF9800"
              onPress={() => console.log('Navigate to Payroll Processing')}
            />
            <QuickActionCard
              title="Leave Management"
              description="Approve and manage leaves"
              icon="calendar"
              color="#F44336"
              onPress={() => console.log('Navigate to Leave Management')}
            />
            <QuickActionCard
              title="Reports"
              description="View organization reports"
              icon="chart-line"
              color={theme.colors.primary}
              onPress={() => console.log('Navigate to Reports')}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={[styles.recentActivityCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Recent Activity</Title>
          <View style={styles.activityList}>
            <View key="activity-1" style={styles.activityItem}>
              <Chip icon="account-plus" style={styles.activityChip}>
                New employee added
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                2 hours ago
              </Paragraph>
            </View>
            <View key="activity-2" style={styles.activityItem}>
              <Chip icon="cash-check" style={styles.activityChip}>
                Payroll processed
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                1 day ago
              </Paragraph>
            </View>
            <View key="activity-3" style={styles.activityItem}>
              <Chip icon="calendar-check" style={styles.activityChip}>
                Leave approved
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                2 days ago
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
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
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  payrollCard: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  payrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payrollAmount: {
    flex: 1,
  },
  payrollValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  payrollLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  attendanceRate: {
    flex: 1,
    alignItems: 'flex-end',
  },
  attendanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 8,
    marginBottom: 4,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActionsCard: {
    margin: 16,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
  },
  quickActionCardInner: {
    elevation: 1,
  },
  quickActionContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityChip: {
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default ClientDashboard;
