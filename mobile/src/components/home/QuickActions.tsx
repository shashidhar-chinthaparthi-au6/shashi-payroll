import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuickActions = () => {
  const { colors } = useTheme();

  const actions = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      icon: 'clock-check-outline',
      onPress: () => console.log('Mark attendance'),
    },
    {
      id: 'payslip',
      title: 'View Payslip',
      icon: 'file-document-outline',
      onPress: () => console.log('View payslip'),
    },
    {
      id: 'leave',
      title: 'Apply Leave',
      icon: 'calendar-clock',
      onPress: () => console.log('Apply leave'),
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: 'account-outline',
      onPress: () => console.log('View profile'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={action.onPress}
          >
            <Icon name={action.icon} size={24} color="#fff" />
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QuickActions; 