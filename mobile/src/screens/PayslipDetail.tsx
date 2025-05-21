import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

interface PayslipDetail {
  id: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: {
    housing: number;
    transport: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    other: number;
  };
  netAmount: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    totalDays: number;
  };
}

const PayslipDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { payslipId } = route.params as { payslipId: string };

  // Mock data - replace with actual API call
  const payslip: PayslipDetail = {
    id: payslipId,
    month: 'March',
    year: 2024,
    baseSalary: 4000,
    allowances: {
      housing: 1000,
      transport: 500,
      other: 200,
    },
    deductions: {
      tax: 500,
      insurance: 200,
      other: 100,
    },
    netAmount: 4900,
    status: 'Paid',
    paymentDate: '2024-03-31',
    attendance: {
      present: 22,
      absent: 1,
      late: 2,
      totalDays: 23,
    },
  };

  const handleDownload = async () => {
    // Implement PDF download functionality
    console.log('Downloading PDF...');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Payslip for ${payslip.month} ${payslip.year}`,
        // Add PDF file when implementing download
      });
    } catch (error) {
      console.error('Error sharing payslip:', error);
    }
  };

  const renderSection = (title: string, items: { label: string; value: number }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>${item.value.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Payslip - {payslip.month} {payslip.year}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: payslip.status === 'Paid' ? '#4CAF50' : '#FFC107' }]}>
          <Text style={styles.statusText}>{payslip.status}</Text>
        </View>
      </View>

      {renderSection('Base Salary', [
        { label: 'Base Salary', value: payslip.baseSalary },
      ])}

      {renderSection('Allowances', [
        { label: 'Housing Allowance', value: payslip.allowances.housing },
        { label: 'Transport Allowance', value: payslip.allowances.transport },
        { label: 'Other Allowances', value: payslip.allowances.other },
      ])}

      {renderSection('Deductions', [
        { label: 'Tax', value: payslip.deductions.tax },
        { label: 'Insurance', value: payslip.deductions.insurance },
        { label: 'Other Deductions', value: payslip.deductions.other },
      ])}

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
            <Text style={styles.attendanceValue}>{payslip.attendance.totalDays}</Text>
            <Text style={styles.attendanceLabel}>Total Days</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Net Amount</Text>
        <Text style={styles.totalAmount}>${payslip.netAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Text style={styles.buttonText}>Download PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShare}>
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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