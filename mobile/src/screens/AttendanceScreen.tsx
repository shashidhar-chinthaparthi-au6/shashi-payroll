import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { markAttendance } from '../store/slices/attendanceSlice';
import { RootState, AppDispatch } from '../store';
import { shopAPI } from '../services/api';

const AttendanceScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.attendance);
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('User:', user);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [shopsLoading, setShopsLoading] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      setShopsLoading(true);
      try {
        const data = await shopAPI.getShops();
        console.log('Fetched shops:', data);
        setShops(data);
        if (data.length > 0) {
          setSelectedShopId(data[0]._id || data[0].id);
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to fetch shops');
      } finally {
        setShopsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handleManualAttendance = async () => {
    if (!user) {
      console.log('User not found. Please log in again.');
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }
    if (!user.employee) {
      console.log('Employee record not found for user.');
      Alert.alert('Error', 'Employee record not found. Please contact your administrator.');
      return;
    }
    if (!selectedShopId) {
      console.log('No shop selected.');
      Alert.alert('Error', 'Please select a shop.');
      return;
    }
    try {
      console.log('User object:', user);
      console.log('Marking attendance for:', { employeeId: user.employee.id, shopId: selectedShopId });
      await dispatch(markAttendance({ employeeId: user.employee.id, shopId: selectedShopId })).unwrap();
      console.log('Attendance marked successfully.');
      Alert.alert('Success', 'Attendance marked successfully!');
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', error || 'Failed to mark attendance. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.subtitle}>
          Select your shop and press the button below to mark your attendance manually.
        </Text>
        {shopsLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : shops.length > 0 ? (
          <Picker
            selectedValue={selectedShopId}
            onValueChange={(itemValue) => setSelectedShopId(itemValue)}
            style={styles.picker}
          >
            {shops.map((shop: any) => (
              <Picker.Item
                key={shop._id || shop.id}
                label={shop.name}
                value={shop._id || shop.id}
                color="#000"
              />
            ))}
          </Picker>
        ) : (
          <Text style={styles.subtitle}>No shops available</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleManualAttendance}
          disabled={loading || shopsLoading || !selectedShopId}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Mark Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AttendanceScreen; 