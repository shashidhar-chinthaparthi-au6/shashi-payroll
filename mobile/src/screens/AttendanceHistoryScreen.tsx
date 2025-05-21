import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { format, subMonths, addMonths } from 'date-fns';
import { AttendanceRecord, MonthlySummary } from '../types/attendance';

const AttendanceHistoryScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Mock data - Replace with actual API calls
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: '2024-03-20',
      checkIn: '09:00:00',
      checkOut: '18:00:00',
      status: 'present',
    },
    // Add more mock records as needed
  ];

  const mockMonthlySummary: MonthlySummary = {
    month: 'March',
    year: 2024,
    present: 15,
    absent: 2,
    leave: 1,
    total: 18,
  };

  const markedDates = mockAttendanceRecords.reduce((acc, record) => {
    acc[record.date] = {
      marked: true,
      dotColor: record.status === 'present' ? '#4CAF50' : 
                record.status === 'absent' ? '#F44336' : '#FFC107',
    };
    return acc;
  }, {} as any);

  const renderAttendanceRecord = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordDate}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
      <View style={styles.recordDetails}>
        <Text style={styles.recordTime}>
          Check-in: {item.checkIn}
          {item.checkOut && `\nCheck-out: ${item.checkOut}`}
        </Text>
        <Text style={[
          styles.recordStatus,
          { color: item.status === 'present' ? '#4CAF50' : 
                   item.status === 'absent' ? '#F44336' : '#FFC107' }
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendar View</Text>
        <Calendar
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#2196F3',
            },
          }}
          theme={{
            todayTextColor: '#2196F3',
            selectedDayBackgroundColor: '#2196F3',
            dotColor: '#2196F3',
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Present</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              {mockMonthlySummary.present}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Absent</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
              {mockMonthlySummary.absent}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Leave</Text>
            <Text style={[styles.summaryValue, { color: '#FFC107' }]}>
              {mockMonthlySummary.leave}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
              {mockMonthlySummary.total}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Records</Text>
        <FlatList
          data={mockAttendanceRecords}
          renderItem={renderAttendanceRecord}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recordItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
  },
  recordStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AttendanceHistoryScreen; 