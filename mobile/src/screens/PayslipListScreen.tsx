import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchPayslips } from '../store/slices/payslipSlice';
import { RootState } from '../store';
import { Payslip } from '../types';

const PayslipListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { payslips, loading, error } = useSelector(
    (state: RootState) => state.payslip
  );

  useEffect(() => {
    dispatch(fetchPayslips());
  }, [dispatch]);

  const renderItem = ({ item }: { item: Payslip }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PayslipDetail', { payslip: item })}
    >
      <View style={styles.header}>
        <Text style={styles.month}>
          {new Date(`${item.year}-${item.month}-01`).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View style={[styles.status, styles[item.status]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.amount}>₹{item.netSalary.toLocaleString()}</Text>
        <Text style={styles.label}>Net Salary</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!payslips || payslips.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No payslips found</Text>
        <Text style={styles.emptySubtext}>Your payslips will appear here once they are generated</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payslips}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  month: {
    fontSize: 18,
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
  details: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default PayslipListScreen; 