import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { checkIn, checkOut } from '../../services/api';

type Attendance = {
  _id: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
};

type Props = {
  attendance: Attendance;
  employeeId: string;
  onUpdate: () => void;
};

const AttendanceStatus = ({ attendance, employeeId, onUpdate }: Props) => {
  const { colors } = useTheme();

  const getStatusColor = () => {
    if (!attendance) return '#F44336';
    switch (attendance.status) {
      case 'present':
        return attendance.checkOut ? '#2196F3' : '#4CAF50';
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
    if (attendance.checkOut) return 'Checked Out';
    return attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1);
  };

  const handleCheckIn = async () => {
    try {
      await checkIn(employeeId);
      onUpdate();
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut(employeeId);
      onUpdate();
    } catch (error) {
      console.error('Check-out error:', error);
    }
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
              {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              {attendance.checkOut ? ` - ${new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </Text>
          )}
        </View>
      </View>

      {(!attendance || attendance.checkOut) ? (
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckIn}
        >
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckOut}
        >
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  },
  date: {
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
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
});

export default AttendanceStatus; 