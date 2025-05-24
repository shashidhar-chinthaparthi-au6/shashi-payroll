import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { attendanceAPI } from '../services/api';
import { AttendanceRecord } from '../types/attendance';

type Props = {
  userId: string;
};

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
};

const AttendanceHistoryScreen = ({ userId }: Props) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0
  });

  useEffect(() => {
    fetchAttendanceHistory();
  }, [userId]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceAPI.getAttendanceHistory();
      const history = response.history || [];
      setRecords(history);

      // Calculate summary
      const summary = history.reduce((acc: AttendanceSummary, record: AttendanceRecord) => {
        acc.total++;
        switch (record.status.toLowerCase()) {
          case 'present':
            acc.present++;
            break;
          case 'absent':
            acc.absent++;
            break;
          case 'late':
            acc.late++;
            break;
          case 'half-day':
            acc.halfDay++;
            break;
        }
        return acc;
      }, {
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        total: 0
      });
      setSummary(summary);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setError('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'late':
        return '#FF9800';
      case 'half-day':
        return '#9C27B0';
      default:
        return colors.text;
    }
  };

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{summary.present}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>{summary.absent}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{summary.late}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Late</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#9C27B0' }]}>{summary.halfDay}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Half Day</Text>
        </View>
      </View>
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total Days:</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>{summary.total}</Text>
      </View>
    </View>
  );

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.text }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.details}>
        {item.checkIn && (
          <View style={styles.timeContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Check In:</Text>
            <Text style={[styles.time, { color: colors.text }]}>
              {new Date(item.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        
        {item.checkOut && item.checkOut.time && (
          <View style={styles.timeContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Check Out:</Text>
            <Text style={[styles.time, { color: colors.text }]}>
              {new Date(item.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: '#F44336' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Attendance History</Text>
      {renderSummaryCard()}
      <FlatList
        data={records}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  details: {
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginRight: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AttendanceHistoryScreen; 