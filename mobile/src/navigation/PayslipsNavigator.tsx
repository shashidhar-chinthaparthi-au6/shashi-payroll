import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PayslipsList from '../screens/PayslipsList';
import PayslipDetail from '../screens/PayslipDetail';

export type PayslipsStackParamList = {
  PayslipsList: undefined;
  PayslipDetail: { payslipId: string };
};

const Stack = createNativeStackNavigator<PayslipsStackParamList>();

const PayslipsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="PayslipsList"
        component={PayslipsList}
        options={{
          title: 'Payslips',
        }}
      />
      <Stack.Screen
        name="PayslipDetail"
        component={PayslipDetail}
        options={{
          title: 'Payslip Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default PayslipsNavigator; 