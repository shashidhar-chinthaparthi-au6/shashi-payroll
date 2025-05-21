import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, List, Divider } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

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

const leaveHistory = [
  {
    id: '1',
    type: 'casual',
    startDate: '2024-03-01',
    endDate: '2024-03-02',
    status: 'approved',
    reason: 'Personal work',
  },
  {
    id: '2',
    type: 'sick',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    status: 'approved',
    reason: 'Fever',
  },
  // Add more mock data as needed
];

const LeaveHistoryScreen = () => {
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
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.balanceContainer}>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Casual Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.casual.available} days</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Consumed: {leaveBalances.casual.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.casual.total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Sick Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.sick.available} days</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Consumed: {leaveBalances.sick.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.sick.total}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceTitle}>Annual Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalances.annual.available} days</Text>
              <Text style={styles.balanceSubtext}>Available</Text>
              <Text style={styles.consumedText}>Consumed: {leaveBalances.annual.consumed}</Text>
              <Text style={styles.totalText}>Total: {leaveBalances.annual.total}</Text>
            </Card.Content>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Calendar View</Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            todayTextColor: '#007AFF',
            selectedDayBackgroundColor: '#007AFF',
          }}
        />

        <Text style={styles.sectionTitle}>Leave History</Text>
        <List.Section>
          {leaveHistory.map((leave) => (
            <React.Fragment key={leave.id}>
              <List.Item
                title={`${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`}
                description={`${leave.startDate} to ${leave.endDate}`}
                right={() => (
                  <Text
                    style={[
                      styles.status,
                      { color: leave.status === 'approved' ? 'green' : 'orange' },
                    ]}
                  >
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </Text>
                )}
              />
              <Divider />
            </React.Fragment>
          ))}
        </List.Section>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
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
  status: {
    alignSelf: 'center',
    fontWeight: 'bold',
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
});

export default LeaveHistoryScreen; 