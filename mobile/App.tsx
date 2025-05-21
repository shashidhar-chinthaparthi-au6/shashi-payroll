import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import Navigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </Provider>
  );
} 