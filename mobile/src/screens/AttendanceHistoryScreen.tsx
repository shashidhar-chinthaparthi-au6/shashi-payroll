import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { format, parse } from 'date-fns';
import { AttendanceRecord, MonthlySummary } from '../types/attendance';
import { attendanceAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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

// Helper to format time string (HH:mm:ss) to 12-hour format
const formatTo12Hour = (timeStr: string) => {
  if (!timeStr) return 'N/A';
  const parsed = parse(timeStr, 'HH:mm:ss', new Date());
  return format(parsed, 'hh:mm a');
};

const AttendanceHistoryScreen: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Calculate start and end date for API
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      if (!user?.employee?.id) {
        throw new Error('Employee ID not found');
      }
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      const data = await attendanceAPI.getDetailedHistory(
        user.employee.id,
        start,
        end
      );
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      if (!user?.employee?.id) {
        throw new Error('Employee ID not found');
      }
      const data = await attendanceAPI.getMonthlySummary(
        user.employee.id,
        selectedMonth + 1,
        selectedYear
      );
      setMonthlySummary(data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  useEffect(() => {
    if (user?.employee?.id) {
      fetchAttendanceHistory();
      fetchMonthlySummary();
    }
  }, [selectedMonth, selectedYear, user?.employee?.id]);

  const renderAttendanceRecord = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordDate}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
      <View style={styles.recordDetails}>
        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Check-in:</Text>
            <Text style={styles.timeValue}>{item.checkIn ? formatTo12Hour(item.checkIn.time) : 'N/A'}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Check-out:</Text>
            <Text style={styles.timeValue}>{item.checkOut ? formatTo12Hour(item.checkOut.time) : 'N/A'}</Text>
          </View>
        </View>
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

  if (!user?.employee?.id) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please log in to view attendance history</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Present</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}> {monthlySummary?.present || 0} </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Absent</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}> {monthlySummary?.absent || 0} </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Leave</Text>
            <Text style={[styles.summaryValue, { color: '#FFC107' }]}> {monthlySummary?.leave || 0} </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryValue, { color: '#2196F3' }]}> {monthlySummary?.total || 0} </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Records</Text>
        <FlatList
          data={attendanceRecords}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  picker: {
    flex: 1,
    height: 44,
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
  timeContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  recordStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AttendanceHistoryScreen; 