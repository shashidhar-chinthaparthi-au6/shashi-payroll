import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeaveRequestScreen from '../screens/leaves/LeaveRequestScreen';
import LeaveHistoryScreen from '../screens/leaves/LeaveHistoryScreen';

const Stack = createNativeStackNavigator();

const LeavesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LeaveRequest" 
        component={LeaveRequestScreen}
        options={{
          title: 'Request Leave',
        }}
      />
      <Stack.Screen 
        name="LeaveHistory" 
        component={LeaveHistoryScreen}
        options={{
          title: 'Leave History',
        }}
      />
    </Stack.Navigator>
  );
};

export default LeavesNavigator; 