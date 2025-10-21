import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAuth } from './src/store/slices/authSlice';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { setupNetworkMonitoring } from './src/utils/networkLogger';

const AppContent = () => {
  useEffect(() => {
    store.dispatch(initializeAuth());
    setupNetworkMonitoring();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
} 