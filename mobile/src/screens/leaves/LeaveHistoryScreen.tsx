import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, List, Divider } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { leaveAPI } from '../../services/api';

const months = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 },
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const LeaveHistoryScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (user?.id && token) {
      leaveAPI.getLeaveBalance(user.id, token).then(setLeaveBalances);
      const safeMonth = Math.max(1, Math.min(Number(selectedMonth) + 1, 12));
      console.log('Selected month (0-based):', selectedMonth, 'Sent to API:', safeMonth);
      leaveAPI.getLeaveHistory(user.id, token, safeMonth, selectedYear).then(setLeaveHistory);
    }
  }, [user, token, selectedMonth, selectedYear]);

  const getLeaveBalance = (type: string) => {
    return leaveBalances.find(balance => balance.type === type) || { total: 0, used: 0, remaining: 0 };
  };

  const markedDates = leaveHistory.reduce((acc: { [key: string]: { marked: boolean; dotColor: string } }, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      acc[dateStr] = {
        marked: true,
        dotColor: leave.type === 'casual' ? 'blue' : leave.type === 'sick' ? 'red' : 'green',
      };
      current.setDate(current.getDate() + 1);
    }
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Month & Year</Text>
        <View style={styles.pickerRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {months.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={y.toString()} value={y} />
            ))}
          </Picker>
        </View>

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

        <Text style={styles.sectionTitle}>Leave History</Text>
        <List.Section>
          {leaveHistory.length === 0 ? (
            <Text style={{ color: '#888', textAlign: 'center', marginVertical: 16 }}>
              No leave records for this month.
            </Text>
          ) : (
            leaveHistory.map((leave) => (
              <React.Fragment key={leave._id}>
                <List.Item
                  title={`${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`}
                  description={`${leave.startDate?.split('T')[0]} to ${leave.endDate?.split('T')[0]}`}
                  right={() => (
                    <Text
                      style={[
                        styles.status,
                        { color: leave.status === 'approved' ? 'green' : leave.status === 'pending' ? 'orange' : 'red' },
                      ]}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Text>
                  )}
                />
                <Divider />
              </React.Fragment>
            ))
          )}
        </List.Section>
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
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  picker: {
    flex: 1,
    height: 44,
  },
});

export default LeaveHistoryScreen; 