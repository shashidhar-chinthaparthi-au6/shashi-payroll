import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Global UI loader/toaster context colocated to avoid extra files
type Severity = 'success' | 'info' | 'warning' | 'error';
interface UIContextValue { 
  showLoader: (show?: boolean) => void; 
  showToast: (message: string, severity?: Severity, durationMs?: number) => void; 
}
const InternalUIContext = createContext<UIContextValue | undefined>(undefined);

export const useUI = (): UIContextValue => {
  const ctx = useContext(InternalUIContext);
  if (!ctx) throw new Error('useUI must be used within ThemeProvider');
  return ctx;
};

// App Settings (currency/timezone) context
type Currency = 'INR' | 'USD';
interface AppSettings { currency: Currency; timezone: string }
interface AppSettingsContextValue extends AppSettings { setAppSettings: (s: AppSettings) => void }
const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export const useAppSettings = (): AppSettingsContextValue => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within ThemeProvider');
  return ctx;
};

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('themeMode');
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('themeMode', mode);
        console.log('Theme mode changed to:', mode);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    };
    saveTheme();
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      console.log('Theme toggled from', prev, 'to', newMode);
      return newMode;
    });
  }, []);

  // App settings state (defaults)
  const [appSettings, setAppSettingsState] = useState<AppSettings>(() => ({
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  }));

  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const currency = await AsyncStorage.getItem('appCurrency') as Currency;
        const timezone = await AsyncStorage.getItem('appTimezone');
        if (currency) setAppSettingsState(prev => ({ ...prev, currency }));
        if (timezone) setAppSettingsState(prev => ({ ...prev, timezone }));
      } catch (error) {
        console.log('Error loading app settings:', error);
      }
    };
    loadAppSettings();
  }, []);

  const setAppSettings = useCallback(async (s: AppSettings) => {
    setAppSettingsState(s);
    try {
      await AsyncStorage.setItem('appCurrency', s.currency);
      await AsyncStorage.setItem('appTimezone', s.timezone);
      console.log('App settings updated:', s);
    } catch (error) {
      console.log('Error saving app settings:', error);
    }
  }, []);

  const theme = useMemo(() => {
    const baseTheme = mode === 'light' ? MD3LightTheme : MD3DarkTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: mode === 'light' ? '#667eea' : '#90caf9',
        secondary: mode === 'light' ? '#059669' : '#10b981',
        error: mode === 'light' ? '#dc2626' : '#ef4444',
        warning: mode === 'light' ? '#f59e0b' : '#fbbf24',
        info: mode === 'light' ? '#3b82f6' : '#60a5fa',
        success: mode === 'light' ? '#10b981' : '#34d399',
        background: mode === 'light' ? '#f8fafc' : '#0a0a0a',
        surface: mode === 'light' ? '#ffffff' : '#1e1e1e',
        text: mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)',
      },
      roundness: 16,
    };
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  const [loading, setLoading] = useState(false);

  const showLoader = useCallback((show: boolean = true) => setLoading(show), []);
  const showToast = useCallback((message: string, severity: Severity = 'info', durationMs: number = 3000) => {
    Alert.alert(
      severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : severity === 'success' ? 'Success' : 'Info',
      message,
      [{ text: 'OK' }]
    );
  }, []);

  const uiValue = useMemo(() => ({ showLoader, showToast }), [showLoader, showToast]);

  return (
    <ThemeContext.Provider value={value}>
      <InternalUIContext.Provider value={uiValue}>
        <AppSettingsContext.Provider value={{ ...appSettings, setAppSettings }}>
          <PaperProvider theme={theme}>
            {children}
            {loading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
              }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </PaperProvider>
        </AppSettingsContext.Provider>
      </InternalUIContext.Provider>
    </ThemeContext.Provider>
  );
};
