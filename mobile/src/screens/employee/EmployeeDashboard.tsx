import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Chip, IconButton, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { employeeAPI } from '../../utils/api';

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [attendanceStatus, setAttendanceStatus] = useState({
    todayStatus: 'not-checked-in',
    checkInTime: null as string | null,
    checkOutTime: null as string | null,
    hoursWorked: 0,
  });

  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      showLoader(true);
      
      // Fetch comprehensive employee dashboard data from backend
      const [dashboardResponse, attendanceResponse, leavesResponse, attendanceStatsResponse] = await Promise.all([
        employeeAPI.getDashboard(),
        employeeAPI.getAttendanceHistory(),
        employeeAPI.getLeaves(),
        employeeAPI.getAttendanceStats()
      ]);

      const dashboardData = dashboardResponse.data || {};
      const attendanceData = attendanceResponse.data || [];
      const leavesData = leavesResponse.data || [];
      const attendanceStats = attendanceStatsResponse.data || {};

      // Use dashboard data if available, otherwise calculate from individual responses
      const totalDays = dashboardData.totalDays || attendanceData.length;
      const presentDays = dashboardData.presentDays || attendanceData.filter((a: any) => a.status === 'present').length;
      const absentDays = dashboardData.absentDays || attendanceData.filter((a: any) => a.status === 'absent').length;
      const leaveDays = dashboardData.leaveDays || leavesData.filter((l: any) => l.status === 'approved').length;

      setStats({
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
      });
    } catch (error) {
      console.log('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      showLoader(true);
      await employeeAPI.markAttendance({ type: 'check-in' });
      showToast('Checked in successfully', 'success');
      setAttendanceStatus(prev => ({
        ...prev,
        todayStatus: 'checked-in',
        checkInTime: new Date().toLocaleTimeString(),
      }));
    } catch (error) {
      showToast('Failed to check in', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      showLoader(true);
      await employeeAPI.markAttendance({ type: 'check-out' });
      showToast('Checked out successfully', 'success');
      setAttendanceStatus(prev => ({
        ...prev,
        todayStatus: 'checked-out',
        checkOutTime: new Date().toLocaleTimeString(),
        hoursWorked: 8.5,
      }));
    } catch (error) {
      showToast('Failed to check out', 'error');
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}>
          Good morning, {user?.firstName}!
        </Title>
        <Paragraph style={[styles.welcomeSubtitle, { color: theme.colors.onSurface }]}>
          Ready to start your day?
        </Paragraph>
      </View>

      {/* Attendance Status Card */}
      <Card style={[styles.attendanceCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Today's Attendance
          </Title>
          <View style={styles.attendanceStatus}>
            <Chip
              icon={attendanceStatus.todayStatus === 'checked-in' ? 'clock-in' : 'clock-out'}
              style={[
                styles.statusChip,
                {
                  backgroundColor: attendanceStatus.todayStatus === 'checked-in' 
                    ? theme.colors.primary 
                    : "#FF9800"
                }
              ]}
            >
              {attendanceStatus.todayStatus === 'checked-in' ? 'Checked In' : 'Not Checked In'}
            </Chip>
            {attendanceStatus.checkInTime && (
              <Paragraph style={[styles.timeText, { color: theme.colors.onSurface }]}>
                Check In: {attendanceStatus.checkInTime}
              </Paragraph>
            )}
            {attendanceStatus.checkOutTime && (
              <Paragraph style={[styles.timeText, { color: theme.colors.onSurface }]}>
                Check Out: {attendanceStatus.checkOutTime}
              </Paragraph>
            )}
            {attendanceStatus.hoursWorked > 0 && (
              <Paragraph style={[styles.timeText, { color: theme.colors.onSurface }]}>
                Hours Worked: {attendanceStatus.hoursWorked}
              </Paragraph>
            )}
          </View>
          <View style={styles.attendanceActions}>
            {attendanceStatus.todayStatus === 'not-checked-in' && (
              <Button
                mode="contained"
                onPress={handleCheckIn}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              >
                Check In
              </Button>
            )}
            {attendanceStatus.todayStatus === 'checked-in' && (
              <Button
                mode="contained"
                onPress={handleCheckOut}
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              >
                Check Out
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Present Days"
          value={stats.presentDays}
          icon="check-circle"
          color={theme.colors.primary}
        />
        <StatCard
          title="Absent Days"
          value={stats.absentDays}
          icon="close-circle"
          color={theme.colors.error}
        />
        <StatCard
          title="Leave Days"
          value={stats.leaveDays}
          icon="calendar"
          color={theme.colors.primary}
        />
        <StatCard
          title="Total Days"
          value={stats.totalDays}
          icon="calendar-month"
          color={theme.colors.primary}
        />
      </View>

      {/* Quick Actions */}
      <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Title>
          <View style={styles.quickActionsGrid}>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to attendance history */}}
              style={styles.quickActionButton}
            >
              View Attendance
            </Button>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to payslips */}}
              style={styles.quickActionButton}
            >
              View Payslips
            </Button>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to apply leave */}}
              style={styles.quickActionButton}
            >
              Apply Leave
            </Button>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to profile */}}
              style={styles.quickActionButton}
            >
              View Profile
            </Button>
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
  attendanceCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  attendanceStatus: {
    marginBottom: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  attendanceActions: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 8,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    width: '48%',
    margin: '1%',
  },
});

export default EmployeeDashboard;
