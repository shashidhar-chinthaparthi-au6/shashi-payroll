import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

type Employee = {
  name: string;
  department: string;
  position: string;
};

type Props = {
  employee: Employee;
};

const WelcomeBanner = ({ employee }: Props) => {
  const { colors } = useTheme();
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';

  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good Evening';
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.name}>{employee.name}</Text>
      <Text style={styles.details}>{employee.position} • {employee.department}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  details: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
});

export default WelcomeBanner; 