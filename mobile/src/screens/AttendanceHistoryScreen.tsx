import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceHistory } from '../store/slices/attendanceSlice';
import { RootState, AppDispatch } from '../store';
import { Attendance } from '../types';

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid Time';
  }
};

const AttendanceHistoryScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading, error } = useSelector(
    (state: RootState) => state.attendance
  );

  useEffect(() => {
    dispatch(fetchAttendanceHistory());
  }, [dispatch]);

  const renderItem = ({ item }: { item: Attendance }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <View style={styles.details}>
        <Text style={styles.time}>
          Check-in: {formatTime(item.checkIn.time)}
        </Text>
        {item.checkOut && (
          <Text style={styles.time}>
            Check-out: {formatTime(item.checkOut.time)}
          </Text>
        )}
      </View>
      <View style={[styles.status, styles[item.status]]}>
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!records || records.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No attendance records found</Text>
        <Text style={styles.emptySubtext}>Your attendance history will appear here once you start marking attendance</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  details: {
    marginBottom: 8,
  },
  time: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
  },
  late: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  error: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default AttendanceHistoryScreen; 