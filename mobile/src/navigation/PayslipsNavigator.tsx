import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PayslipsList from '../screens/PayslipsList';
import PayslipDetail from '../screens/PayslipDetail';

export type PayslipsStackParamList = {
  PayslipsList: { employeeId?: string };
  PayslipDetail: { payslipId: string };
};

const Stack = createNativeStackNavigator<PayslipsStackParamList>();

interface PayslipsNavigatorProps {
  employeeId?: string;
}

const PayslipsNavigator: React.FC<PayslipsNavigatorProps> = ({ employeeId }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="PayslipsList" 
        component={PayslipsList}
        initialParams={employeeId ? { employeeId } : undefined}
        options={{ title: 'Payslips' }}
      />
      <Stack.Screen 
        name="PayslipDetail" 
        component={PayslipDetail}
        options={{ title: 'Payslip Details' }}
      />
    </Stack.Navigator>
  );
};

export default PayslipsNavigator; 