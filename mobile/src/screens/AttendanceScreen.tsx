import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { markAttendance } from '../store/slices/attendanceSlice';
import { RootState, AppDispatch } from '../store';
import { useTheme } from '@react-navigation/native';
import { attendanceAPI } from '../services/api';

type Props = {
  userId: string;
  onUpdate: () => void;
};

const AttendanceScreen = ({ userId, onUpdate }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleManualAttendance = async () => {
    if (!userId) {
      console.log('User not found. Please log in again.');
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      await attendanceAPI.markAttendance(userId);
      onUpdate();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', error || 'Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Attendance</Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleManualAttendance}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Mark Attendance</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen; 