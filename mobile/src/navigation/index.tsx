import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import PayslipListScreen from '../screens/PayslipListScreen';
import PayslipDetailScreen from '../screens/PayslipDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{
          title: 'Mark Attendance',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={AttendanceHistoryScreen}
        options={{
          title: 'Attendance History',
        }}
      />
      <Tab.Screen 
        name="Payslips" 
        component={PayslipListScreen}
        options={{
          title: 'My Payslips',
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  console.log('Token:', token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="PayslipDetail" 
              component={PayslipDetailScreen}
              options={{
                headerShown: true,
                title: 'Payslip Details',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 