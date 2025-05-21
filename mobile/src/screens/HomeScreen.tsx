import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import WelcomeBanner from '../components/home/WelcomeBanner';
import AttendanceStatus from '../components/home/AttendanceStatus';
import QuickActions from '../components/home/QuickActions';
import NotificationsList from '../components/home/NotificationsList';
import CalendarWidget from '../components/home/CalendarWidget';
import { getDashboardData } from '../services/api';

type DashboardData = {
  employee: {
    name: string;
    department: string;
    position: string;
  };
  attendance: {
    _id: string;
    checkIn: string;
    checkOut?: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
  };
  notifications: Array<{
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    createdAt: string;
    isRead: boolean;
  }>;
  events: Array<{
    _id: string;
    title: string;
    date: string;
    type: 'holiday' | 'leave' | 'meeting';
  }>;
};

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [employeeId] = useState('682da825abb9b474aca68267'); // Actual seeded employee ID

  const fetchDashboardData = async () => {
    try {
      const data = await getDashboardData(employeeId);
      // Override events with static data for testing
      const staticEvents = [
        { _id: '1', title: 'Team Meeting', date: '2023-10-15', type: 'meeting' },
        { _id: '2', title: 'Holiday', date: '2023-10-20', type: 'holiday' },
        { _id: '3', title: 'Leave', date: '2023-10-25', type: 'leave' }
      ];
      setDashboardData({ ...data, events: staticEvents });
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <WelcomeBanner employee={dashboardData.employee} />
      <AttendanceStatus 
        attendance={dashboardData.attendance}
        employeeId={employeeId}
        onUpdate={fetchDashboardData}
      />
      <QuickActions />
      <NotificationsList notifications={dashboardData.notifications} />
      <CalendarWidget events={dashboardData.events} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default HomeScreen; 