import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { attendanceAPI } from '../../services/api';

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

type Props = {
  attendance: Attendance | null;
  userId: string;
  onUpdate: () => void;
};

const AttendanceStatus = ({ attendance, userId, onUpdate }: Props) => {
  const { colors } = useTheme();

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getStatusColor = () => {
    if (!attendance) return '#F44336';
    switch (attendance.status) {
      case 'present':
        return attendance.checkOut?.time ? '#2196F3' : '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'half-day':
        return '#9C27B0';
      case 'absent':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  const getStatusText = () => {
    if (!attendance) return 'Not Checked In';
    if (attendance.checkOut?.time) return 'Shift Completed';
    return attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1);
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.markAttendance(userId);
      onUpdate();
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.markAttendance(userId);
      onUpdate();
    } catch (error) {
      console.error('Check-out error:', error);
    }
  };

  const renderActionButton = () => {
    if (!attendance) {
      return (
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckIn}
        >
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
      );
    }

    if (attendance.checkOut?.time) {
      return (
        <View style={styles.completedContainer}>
          <Icon name="check-circle" size={24} color="#4CAF50" style={styles.completedIcon} />
          <Text style={styles.completedText}>Shift completed for today</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
        onPress={handleCheckOut}
      >
        <Text style={styles.buttonText}>Check Out</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Attendance</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>
      
      <View style={[styles.statusCard, { backgroundColor: getStatusColor() }]}>
        <Icon name="clock-outline" size={24} color="#fff" />
        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {attendance && (
            <Text style={styles.timeText}>
              {attendance.checkIn ? new Date(attendance.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              {attendance.checkOut?.time ? ` - ${new Date(attendance.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </Text>
          )}
        </View>
      </View>

      {renderActionButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  checkoutButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  completedIcon: {
    marginRight: 8,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceStatus; 