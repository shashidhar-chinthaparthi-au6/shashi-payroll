import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Employee Information</Text>
          {/* Add more profile information here */}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 