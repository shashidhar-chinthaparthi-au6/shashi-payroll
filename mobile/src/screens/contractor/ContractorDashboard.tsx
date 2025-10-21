import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, useTheme, Chip, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { contractorAPI } from '../../utils/api';

interface DashboardStats {
  totalHours: number;
  thisMonthHours: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  attendanceRate: number;
  activeContracts: number;
}

const ContractorDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    thisMonthHours: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    attendanceRate: 0,
    activeContracts: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      showLoader(true);
      
      const [dashboardResponse, attendanceResponse, invoicesResponse, contractsResponse] = await Promise.all([
        contractorAPI.getDashboard(),
        contractorAPI.getAttendanceHistory(),
        contractorAPI.getInvoices(),
        contractorAPI.getContracts()
      ]);

      const dashboardData = dashboardResponse.data || {};
      const attendance = attendanceResponse.data || [];
      const invoices = invoicesResponse.data || [];
      const contracts = contractsResponse.data || [];

      setStats({
        totalHours: dashboardData.totalHours || attendance.reduce((sum: number, a: any) => sum + (a.hours || 0), 0),
        thisMonthHours: dashboardData.thisMonthHours || 0,
        pendingInvoices: dashboardData.pendingInvoices || invoices.filter((i: any) => i.status === 'pending').length,
        paidInvoices: dashboardData.paidInvoices || invoices.filter((i: any) => i.status === 'paid').length,
        totalEarnings: dashboardData.totalEarnings || invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
        thisMonthEarnings: dashboardData.thisMonthEarnings || 0,
        attendanceRate: dashboardData.attendanceRate || 0,
        activeContracts: dashboardData.activeContracts || contracts.filter((c: any) => c.status === 'active').length,
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
          Welcome back, {user?.firstName || 'Contractor'}!
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Track your work, earnings, and manage your contracts
        </Paragraph>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="This Month Hours"
          value={`${stats.thisMonthHours}h`}
          icon="clock"
          color={theme.colors.primary}
        />
        <StatCard
          title="Total Hours"
          value={`${stats.totalHours}h`}
          icon="clock-outline"
          color={theme.colors.secondary}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon="file-document-outline"
          color="#FF9800"
        />
        <StatCard
          title="Paid Invoices"
          value={stats.paidInvoices}
          icon="cash-check"
          color="#4CAF50"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts}
          icon="briefcase"
          color={theme.colors.primary}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon="chart-line"
          color="#2196F3"
        />
      </View>

      {/* Earnings Card */}
      <Card style={[styles.earningsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Earnings Overview</Title>
          <View style={styles.earningsContent}>
            <View style={styles.earningsAmount}>
              <Title style={[styles.earningsValue, { color: theme.colors.primary }]}>
                ₹{stats.totalEarnings.toLocaleString()}
              </Title>
              <Paragraph style={[styles.earningsLabel, { color: theme.colors.onSurface }]}>
                Total Earnings
              </Paragraph>
            </View>
            <View style={styles.monthlyEarnings}>
              <Title style={[styles.monthlyValue, { color: theme.colors.secondary }]}>
                ₹{stats.thisMonthEarnings.toLocaleString()}
              </Title>
              <Paragraph style={[styles.monthlyLabel, { color: theme.colors.onSurface }]}>
                This Month
              </Paragraph>
            </View>
          </View>
          <View style={styles.attendanceProgress}>
            <Paragraph style={[styles.progressLabel, { color: theme.colors.onSurface }]}>
              Attendance Rate
            </Paragraph>
            <ProgressBar 
              progress={stats.attendanceRate / 100} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Paragraph style={[styles.progressValue, { color: theme.colors.onSurface }]}>
              {stats.attendanceRate}%
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Mark Attendance"
              description="Check in/out for work"
              icon="clock-in"
              color={theme.colors.primary}
              onPress={() => console.log('Navigate to Mark Attendance')}
            />
            <QuickActionCard
              title="View Invoices"
              description="Check your invoices"
              icon="file-document"
              color="#4CAF50"
              onPress={() => console.log('Navigate to View Invoices')}
            />
            <QuickActionCard
              title="Apply Leave"
              description="Request time off"
              icon="calendar"
              color="#FF9800"
              onPress={() => console.log('Navigate to Apply Leave')}
            />
            <QuickActionCard
              title="View Profile"
              description="Manage your profile"
              icon="account"
              color={theme.colors.secondary}
              onPress={() => console.log('Navigate to View Profile')}
            />
            <QuickActionCard
              title="Attendance History"
              description="View your attendance"
              icon="history"
              color="#2196F3"
              onPress={() => console.log('Navigate to Attendance History')}
            />
            <QuickActionCard
              title="Reports"
              description="View your reports"
              icon="chart-line"
              color="#9C27B0"
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
              <Chip icon="clock-in" style={styles.activityChip}>
                Checked in at 9:00 AM
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                Today
              </Paragraph>
            </View>
            <View key="activity-2" style={styles.activityItem}>
              <Chip icon="cash-check" style={styles.activityChip}>
                Invoice paid - ₹25,000
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                2 days ago
              </Paragraph>
            </View>
            <View key="activity-3" style={styles.activityItem}>
              <Chip icon="file-document" style={styles.activityChip}>
                New invoice created
              </Chip>
              <Paragraph style={[styles.activityTime, { color: theme.colors.onSurface }]}>
                1 week ago
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
  earningsCard: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  earningsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  earningsAmount: {
    flex: 1,
  },
  earningsValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  earningsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  monthlyEarnings: {
    flex: 1,
    alignItems: 'flex-end',
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthlyLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  attendanceProgress: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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

export default ContractorDashboard;
