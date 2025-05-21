import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, SegmentedButtons, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LeaveType = 'casual' | 'sick' | 'annual';

type RootStackParamList = {
  LeaveRequest: undefined;
  LeaveHistory: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LeaveRequest'>;

// Mock data - replace with actual data from your backend
const leaveBalances = {
  casual: {
    total: 10,
    consumed: 3,
    available: 7
  },
  sick: {
    total: 7,
    consumed: 2,
    available: 5
  },
  annual: {
    total: 20,
    consumed: 8,
    available: 12
  }
};

const LeaveRequestScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSubmit = () => {
    // TODO: Implement leave request submission
    console.log({
      leaveType,
      startDate,
      endDate,
      reason,
    });
  };

  const getDaysDifference = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = getDaysDifference(startDate, endDate);
  const availableDays = leaveBalances[leaveType].available;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.balanceContainer}>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Casual Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.casual.available}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {leaveBalances.casual.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.casual.total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Sick Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.sick.available}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {leaveBalances.sick.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.sick.total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Annual Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.annual.available}</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Used: {leaveBalances.annual.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.annual.total}</Text>
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
        >
          {startDate.toLocaleDateString()}
        </Button>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>End Date</Text>
        <Button 
          mode="outlined" 
          onPress={() => setShowEndDatePicker(true)}
        >
          {endDate.toLocaleDateString()}
        </Button>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
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
          disabled={requestedDays > availableDays || !reason.trim()}
        >
          Submit Request
        </Button>

        <Button 
          mode="text" 
          onPress={() => navigation.navigate('LeaveHistory')}
          style={styles.historyButton}
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
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
  },
  warningText: {
    color: '#FF6B6B',
  },
  submitButton: {
    marginTop: 24,
  },
  historyButton: {
    marginTop: 8,
  },
});

export default LeaveRequestScreen; 