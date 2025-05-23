import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { payslipAPI } from '../services/api';

interface PayslipDetail {
  _id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  netSalary: number;
  status: 'pending' | 'approved' | 'rejected';
  generatedAt: string;
  approvedAt: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
  };
  pdfUrl: string;
}

const PayslipDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { payslipId } = route.params as { payslipId: string };
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslipDetails();
  }, [payslipId]);

  const fetchPayslipDetails = async () => {
    try {
      setLoading(true);
      const data = await payslipAPI.getPayslipById(payslipId);
      setPayslip(data);
    } catch (error) {
      console.error('Error fetching payslip details:', error);
      Alert.alert('Error', 'Failed to fetch payslip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const pdfBlob = await payslipAPI.downloadPayslip(payslipId);
      const fileUri = FileSystem.documentDirectory + 'payslip.pdf';
      await FileSystem.writeAsStringAsync(fileUri, pdfBlob, {
        encoding: FileSystem.EncodingType.Base64
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      Alert.alert('Error', 'Failed to download payslip');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!payslip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Payslip not found</Text>
      </View>
    );
  }

  const renderSection = (title: string, items: { label: string; value: number }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{formatCurrency(item.value)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Payslip - {months[payslip.month - 1]} {payslip.year}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: payslip.status === 'approved' ? '#4CAF50' : '#FFC107' }]}>
          <Text style={styles.statusText}>{payslip.status.toUpperCase()}</Text>
        </View>
      </View>

      {renderSection('Basic Salary', [
        { label: 'Basic Salary', value: payslip.basicSalary },
      ])}

      {renderSection('Allowances', payslip.allowances.map(a => ({
        label: a.name,
        value: a.amount
      })))}

      {renderSection('Deductions', payslip.deductions.map(d => ({
        label: d.name,
        value: d.amount
      })))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        <View style={styles.attendanceGrid}>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{payslip.attendance.present}</Text>
            <Text style={styles.attendanceLabel}>Present</Text>
          </View>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{payslip.attendance.absent}</Text>
            <Text style={styles.attendanceLabel}>Absent</Text>
          </View>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{payslip.attendance.late}</Text>
            <Text style={styles.attendanceLabel}>Late</Text>
          </View>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{payslip.attendance.halfDay}</Text>
            <Text style={styles.attendanceLabel}>Half Day</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dates</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Generated On</Text>
          <Text style={styles.value}>{formatDate(payslip.generatedAt)}</Text>
        </View>
        {payslip.approvedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Approved On</Text>
            <Text style={styles.value}>{formatDate(payslip.approvedAt)}</Text>
          </View>
        )}
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Net Salary</Text>
        <Text style={styles.totalAmount}>{formatCurrency(payslip.netSalary)}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownload}>
            <Text style={styles.buttonText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleDownload}>
            <Text style={styles.buttonText}>Share PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attendanceItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  attendanceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
  },
  actions: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayslipDetail; 