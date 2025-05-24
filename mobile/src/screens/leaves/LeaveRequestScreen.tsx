import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, SegmentedButtons, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { leaveAPI } from '../../services/api';

type LeaveType = 'casual' | 'sick' | 'annual';

type RootStackParamList = {
  LeaveRequest: undefined;
  LeaveHistory: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LeaveRequest'>;

const LeaveRequestScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);

  useEffect(() => {
    if (user?.employee?.id && token) {
      leaveAPI.getLeaveBalance(user.employee.id, token).then(setLeaveBalances);
    }
  }, [user, token]);

  const getLeaveBalance = (type: string) => {
    return leaveBalances.find(balance => balance.type === type) || { total: 0, used: 0, remaining: 0 };
  };

  const handleSubmit = async () => {
    if (!user?.employee?.id) {
      Alert.alert('Error', 'Employee information not found.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'User token not found.');
      return;
    }
    try {
      await leaveAPI.requestLeave({
        employeeId: user.employee.id,
        type: leaveType,
        startDate,
        endDate,
        reason
      }, token);
      Alert.alert('Success', 'Leave request submitted!');
      setReason('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit leave request.');
    }
  };

  const getDaysDifference = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = getDaysDifference(startDate, endDate);
  const availableDays = getLeaveBalance('casual').remaining;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.balanceContainer}>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Casual Leave</Text>
              <Text style={styles.balanceValue}>{getLeaveBalance('casual').remaining}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {getLeaveBalance('casual').used}</Text>
              <Text style={styles.totalText}>Total: {getLeaveBalance('casual').total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Sick Leave</Text>
              <Text style={styles.balanceValue}>{getLeaveBalance('sick').remaining}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {getLeaveBalance('sick').used}</Text>
              <Text style={styles.totalText}>Total: {getLeaveBalance('sick').total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Annual Leave</Text>
              <Text style={styles.balanceValue}>{getLeaveBalance('annual').remaining}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {getLeaveBalance('annual').used}</Text>
              <Text style={styles.totalText}>Total: {getLeaveBalance('annual').total}</Text>
            </Card.Content>
          </Card>
        </View>

        <Text style={styles.label}>Leave Type</Text>
        <SegmentedButtons
          value={leaveType}
          onValueChange={value => setLeaveType(value as LeaveType)}
          buttons={[
            { value: 'casual', label: 'Casual' },
            { value: 'sick', label: 'Sick' },
            { value: 'annual', label: 'Annual' },
          ]}
        />

        <Text style={styles.label}>Start Date</Text>
        <Button
          mode="outlined"
          onPress={() => setShowStartDatePicker(true)}
          style={styles.dateButton}
          labelStyle={styles.dateButtonLabel}
        >
          {startDate.toLocaleDateString()}
        </Button>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (event.type === 'set' && selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>End Date</Text>
        <Button
          mode="outlined"
          onPress={() => setShowEndDatePicker(true)}
          style={styles.dateButton}
          labelStyle={styles.dateButtonLabel}
        >
          {endDate.toLocaleDateString()}
        </Button>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (event.type === 'set' && selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>Duration</Text>
        <Text style={styles.durationText}>
          {requestedDays} day{requestedDays !== 1 ? 's' : ''}
          {requestedDays > availableDays && (
            <Text style={styles.warningText}> (Exceeds available balance)</Text>
          )}
        </Text>

        <Text style={styles.label}>Reason</Text>
        <TextInput
          mode="outlined"
          style={styles.reasonInput}
          theme={{ colors: { text: '#222', placeholder: '#888', primary: '#007AFF', background: '#fff' } }}
          multiline
          numberOfLines={4}
          value={reason}
          onChangeText={setReason}
          placeholder="Enter reason for leave"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
          disabled={requestedDays > availableDays || !reason.trim()}
        >
          Submit Request
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('LeaveHistory')}
          style={styles.historyButton}
          labelStyle={styles.historyButtonLabel}
        >
          View Leave History
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 20,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#222',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#f5faff',
    borderRadius: 10,
    elevation: 2,
  },
  balanceTitle: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#222',
  },
  status: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  consumedText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  totalText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  durationText: {
    fontSize: 16,
    marginTop: 8,
    color: '#222',
  },
  warningText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  reasonInput: {
    backgroundColor: '#fff',
    color: '#222',
    marginTop: 8,
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    marginBottom: 8,
  },
  dateButtonLabel: {
    color: '#222',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  historyButton: {
    marginTop: 16,
    borderColor: '#007AFF',
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: '#f5faff',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default LeaveRequestScreen; 