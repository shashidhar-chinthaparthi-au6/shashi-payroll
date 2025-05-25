import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import WelcomeBanner from '../components/home/WelcomeBanner';
import AttendanceStatus from '../components/home/AttendanceStatus';
import QuickActions from '../components/home/QuickActions';
import NotificationsList from '../components/home/NotificationsList';
import CalendarWidget from '../components/home/CalendarWidget';
import { getDashboardData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type Attendance = {
  id: string;
  date: string;
  checkIn: {
    time: string;
    method: string;
  };
  checkOut?: {
    time?: string;
    method: string;
  };
  status: 'present' | 'absent' | 'late' | 'half-day';
};

type DashboardData = {
  employee: {
    name: string;
    department: string;
    position: string;
  };
  attendance: Attendance;
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
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const data = await getDashboardData(user.id);
      console.log('Raw API response:', data); // Debug log

      // Transform attendance data to match expected type
      const transformedAttendance = data.attendance ? {
        id: data.attendance._id,
        date: data.attendance.date,
        checkIn: {
          time: data.attendance.checkIn.time,
          method: data.attendance.checkIn.method
        },
        checkOut: data.attendance.checkOut ? {
          time: data.attendance.checkOut.time,
          method: data.attendance.checkOut.method
        } : undefined,
        status: data.attendance.status
      } : null;

      console.log('Transformed attendance:', transformedAttendance); // Debug log

      // Override events with static data for testing
      const staticEvents = [
        { _id: '1', title: 'Team Meeting', date: '2023-10-15', type: 'meeting' },
        { _id: '2', title: 'Holiday', date: '2023-10-20', type: 'holiday' },
        { _id: '3', title: 'Leave', date: '2023-10-25', type: 'leave' }
      ];
      setDashboardData({ ...data, attendance: transformedAttendance, events: staticEvents });
      setError(null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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

  if (!dashboardData || !user?.id) {
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
        userId={user.id}
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