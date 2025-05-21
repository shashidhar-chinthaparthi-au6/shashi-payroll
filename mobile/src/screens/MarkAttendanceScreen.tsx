import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { format } from 'date-fns';
import { AttendanceState } from '../types/attendance';

const MarkAttendanceScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    currentStatus: 'not-checked-in',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      // TODO: Implement API call to mark check-in
      setAttendanceState({
        currentStatus: 'checked-in',
        lastCheckIn: currentTime.toISOString(),
      });
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      // TODO: Implement API call to mark check-out
      setAttendanceState({
        currentStatus: 'checked-out',
        lastCheckIn: attendanceState.lastCheckIn,
        lastCheckOut: currentTime.toISOString(),
      });
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.dateText}>
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text style={styles.timeText}>
          {format(currentTime, 'hh:mm:ss a')}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Current Status:</Text>
        <Text style={[
          styles.statusText,
          { color: attendanceState.currentStatus === 'checked-in' ? '#4CAF50' : 
                   attendanceState.currentStatus === 'checked-out' ? '#F44336' : '#757575' }
        ]}>
          {attendanceState.currentStatus === 'checked-in' ? 'Checked In' :
           attendanceState.currentStatus === 'checked-out' ? 'Checked Out' : 'Not Checked In'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.checkInButton,
            attendanceState.currentStatus !== 'not-checked-in' && styles.disabledButton
          ]}
          onPress={handleCheckIn}
          disabled={attendanceState.currentStatus !== 'not-checked-in'}
        >
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.checkOutButton,
            attendanceState.currentStatus !== 'checked-in' && styles.disabledButton
          ]}
          onPress={handleCheckOut}
          disabled={attendanceState.currentStatus !== 'checked-in'}
        >
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Notes:</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any remarks here..."
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dateText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: 20,
  },
  notesLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default MarkAttendanceScreen; 