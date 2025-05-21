import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import Navigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAuth } from './src/store/slices/authSlice';
import { PaperProvider } from 'react-native-paper';

const AppContent = () => {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
} 