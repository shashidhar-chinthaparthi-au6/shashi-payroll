import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { PayslipsStackParamList } from '../navigation/PayslipsNavigator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { payslipAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type PayslipsScreenNavigationProp = NativeStackNavigationProp<PayslipsStackParamList, 'PayslipsList'>;

interface Payslip {
  _id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  netSalary: number;
  status: 'pending' | 'approved' | 'rejected';
  pdfUrl: string;
  generatedAt: string;
  approvedAt: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
  };
}

const PayslipsList = () => {
  const navigation = useNavigation<PayslipsScreenNavigationProp>();
  const route = useRoute();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user?.employee?.id) {
      fetchPayslips();
    }
  }, [selectedYear, user?.employee?.id]);

  const fetchPayslips = async () => {
    if (!user?.employee?.id) {
      Alert.alert('Error', 'Employee ID not found');
      return;
    }

    try {
      setLoading(true);
      const data = await payslipAPI.getPayslipsByEmployeeId(user.employee.id);
      console.log("All payslips:", data);
      console.log("Selected year:", selectedYear, "Type:", typeof selectedYear);
      
      // Filter payslips by selected year
      const filteredPayslips = data.filter((payslip: Payslip) => {
        console.log("Payslip year:", payslip.year, "Type:", typeof payslip.year);
        return Number(payslip.year) === Number(selectedYear);
      });
      
      console.log("Filtered payslips:", filteredPayslips);
      setPayslips(filteredPayslips);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      Alert.alert('Error', 'Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslipId: string) => {
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

  const getStatusColor = (status: Payslip['status']) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const renderPayslipItem = ({ item }: { item: Payslip }) => (
    <TouchableOpacity
      style={styles.payslipItem}
      onPress={() => navigation.navigate('PayslipDetail', { payslipId: item._id })}
    >
      <View style={styles.payslipInfo}>
        <Text style={styles.monthYear}>{months[item.month - 1]} {item.year}</Text>
        <Text style={styles.amount}>{formatCurrency(item.netSalary)}</Text>
      </View>
      <View style={styles.actions}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownload(item._id)}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.pickerContainer}>
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
      </View>
      <FlatList
        data={payslips}
        renderItem={renderPayslipItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchPayslips}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payslips found for {selectedYear}</Text>
          </View>
        }
      />
    </View>
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
  list: {
    padding: 16,
  },
  payslipItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  payslipInfo: {
    marginBottom: 12,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  downloadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PayslipsList; 