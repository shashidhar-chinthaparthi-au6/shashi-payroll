import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { PayslipsStackParamList } from '../navigation/PayslipsNavigator';

type PayslipsScreenNavigationProp = NativeStackNavigationProp<PayslipsStackParamList, 'PayslipsList'>;

interface Payslip {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: 'Pending' | 'Processed' | 'Paid';
}

const PayslipsList = () => {
  const navigation = useNavigation<PayslipsScreenNavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Mock data - replace with actual API call
  const payslips: Payslip[] = [
    {
      id: '1',
      month: 'March',
      year: 2024,
      amount: 5000,
      status: 'Paid',
    },
    {
      id: '2',
      month: 'February',
      year: 2024,
      amount: 4800,
      status: 'Processed',
    },
  ];

  const getStatusColor = (status: Payslip['status']) => {
    switch (status) {
      case 'Paid':
        return '#4CAF50';
      case 'Processed':
        return '#2196F3';
      case 'Pending':
        return '#FFC107';
      default:
        return '#757575';
    }
  };

  const renderPayslipItem = ({ item }: { item: Payslip }) => (
    <TouchableOpacity
      style={styles.payslipItem}
      onPress={() => navigation.navigate('PayslipDetail', { payslipId: item.id })}
    >
      <View style={styles.payslipInfo}>
        <Text style={styles.monthYear}>{item.month} {item.year}</Text>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
            style={styles.picker}
          >
            {months.map((month, index) => (
              <Picker.Item key={month} label={month} value={index} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            style={styles.picker}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payslips..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={payslips}
        renderItem={renderPayslipItem}
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
  filters: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  payslipItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  payslipInfo: {
    flex: 1,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PayslipsList; 