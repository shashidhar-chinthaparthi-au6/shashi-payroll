import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Payslip } from '../types';

const PayslipDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { payslip } = route.params as { payslip: Payslip };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {new Date(`${payslip.year}-${payslip.month}-01`).toLocaleString(
            'default',
            {
              month: 'long',
              year: 'numeric',
            }
          )}
        </Text>
        <View style={[styles.status, styles[payslip.status]]}>
          <Text style={styles.statusText}>{payslip.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Basic Salary</Text>
          <Text style={styles.value}>{formatCurrency(payslip.basicSalary)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Allowances</Text>
          <Text style={styles.value}>{formatCurrency(payslip.allowances)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deductions</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Deductions</Text>
          <Text style={[styles.value, styles.deduction]}>
            -{formatCurrency(payslip.deductions)}
          </Text>
        </View>
      </View>

      <View style={styles.total}>
        <Text style={styles.totalLabel}>Net Salary</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(payslip.netSalary)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => {
          // Implement download functionality
        }}
      >
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paid: {
    backgroundColor: '#4CAF50',
  },
  pending: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deduction: {
    color: '#F44336',
  },
  total: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayslipDetailScreen; 