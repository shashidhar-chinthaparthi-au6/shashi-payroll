import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline, Backdrop, CircularProgress, Snackbar, Alert, responsiveFontSizes } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Global UI loader/toaster context colocated to avoid extra files
type Severity = 'success' | 'info' | 'warning' | 'error';
interface UIContextValue { showLoader: (show?: boolean) => void; showToast: (message: string, severity?: Severity, durationMs?: number) => void; }
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
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    console.log('Theme mode changed to:', mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      console.log('Theme toggled from', prev, 'to', newMode);
      return newMode;
    });
  }, []);

  // App settings state (defaults)
  const [appSettings, setAppSettingsState] = useState<AppSettings>(() => {
    const currency = (localStorage.getItem('appCurrency') as Currency) || 'INR';
    const timezone = localStorage.getItem('appTimezone') || (currency === 'INR' ? 'Asia/Kolkata' : 'America/New_York');
    return { currency, timezone };
  });
  const setAppSettings = useCallback((s: AppSettings) => {
    setAppSettingsState(s);
    localStorage.setItem('appCurrency', s.currency);
    localStorage.setItem('appTimezone', s.timezone);
    // Force a small delay to ensure state updates are processed
    setTimeout(() => {
      console.log('App settings updated:', s);
    }, 100);
  }, []);

  const theme = useMemo(() => {
    console.log('Creating theme with mode:', mode);
    let t = createTheme({
      palette: {
        mode,
        primary: { 
          main: mode === 'light' ? '#667eea' : '#90caf9',
          light: mode === 'light' ? '#a5b4fc' : '#bbdefb',
          dark: mode === 'light' ? '#4f46e5' : '#42a5f5',
        },
        secondary: {
          main: mode === 'light' ? '#059669' : '#10b981',
          light: mode === 'light' ? '#34d399' : '#6ee7b7',
          dark: mode === 'light' ? '#047857' : '#059669',
        },
        error: {
          main: mode === 'light' ? '#dc2626' : '#ef4444',
          light: mode === 'light' ? '#f87171' : '#fca5a5',
          dark: mode === 'light' ? '#b91c1c' : '#dc2626',
        },
        warning: {
          main: mode === 'light' ? '#f59e0b' : '#fbbf24',
          light: mode === 'light' ? '#fbbf24' : '#fde68a',
          dark: mode === 'light' ? '#d97706' : '#f59e0b',
        },
        info: {
          main: mode === 'light' ? '#3b82f6' : '#60a5fa',
          light: mode === 'light' ? '#93c5fd' : '#93c5fd',
          dark: mode === 'light' ? '#2563eb' : '#3b82f6',
        },
        success: {
          main: mode === 'light' ? '#10b981' : '#34d399',
          light: mode === 'light' ? '#6ee7b7' : '#a7f3d0',
          dark: mode === 'light' ? '#059669' : '#10b981',
        },
        background: {
          default: mode === 'light' ? '#f8fafc' : '#0a0a0a',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)',
          secondary: mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
        },
        divider: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
      },
      shape: { borderRadius: 16 },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { 
          fontWeight: 800,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        },
        h2: { 
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.3,
        },
        h3: { 
          fontWeight: 700,
          fontSize: '1.75rem',
          lineHeight: 1.3,
        },
        h4: { 
          fontWeight: 700,
          fontSize: '1.5rem',
          lineHeight: 1.4,
        },
        h5: { 
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4,
        },
        h6: { 
          fontWeight: 600,
          fontSize: '1.125rem',
          lineHeight: 1.4,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        button: { 
          textTransform: 'none', 
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.4,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              color: mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)',
              backgroundColor: mode === 'light' ? '#f8fafc' : '#0a0a0a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            },
            '*': {
              scrollbarWidth: 'thin',
              scrollbarColor: mode === 'light' ? '#cbd5e1 #f1f5f9' : '#374151 #1f2937',
            },
            '*::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '*::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#1f2937',
              borderRadius: '4px',
            },
            '*::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#374151',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'light' ? '#94a3b8' : '#4b5563',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: { 
              backgroundImage: 'none', 
              borderRadius: 16,
              boxShadow: mode === 'light' 
                ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: { 
              borderRadius: 20,
              border: mode === 'light' 
                ? '1px solid rgba(0, 0, 0, 0.05)' 
                : '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: mode === 'light' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: mode === 'light' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { 
              borderRadius: 12,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '8px 16px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'light' 
                  ? '0 4px 8px rgba(0, 0, 0, 0.12)'
                  : '0 4px 8px rgba(0, 0, 0, 0.3)',
              },
            },
            contained: {
              boxShadow: mode === 'light' 
                ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                : '0 2px 4px rgba(0, 0, 0, 0.3)',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              fontWeight: 500,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              margin: '2px 4px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.04)' 
                  : 'rgba(255, 255, 255, 0.04)',
              },
            },
          },
        },
        MuiTypography: { 
          defaultProps: { color: 'text.primary' },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: mode === 'light' 
                ? '1px solid rgba(0, 0, 0, 0.05)' 
                : '1px solid rgba(255, 255, 255, 0.05)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'light' 
                ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              margin: '2px 0',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateX(4px)',
              },
            },
          },
        },
        MuiBadge: {
          styleOverrides: {
            badge: {
              borderRadius: 8,
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        },
      },
    });
    t = responsiveFontSizes(t);
    return t;
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<Severity>('info');
  const [toastDuration, setToastDuration] = useState(3000);

  const showLoader = useCallback((show: boolean = true) => setLoading(show), []);
  const showToast = useCallback((message: string, severity: Severity = 'info', durationMs: number = 3000) => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastDuration(durationMs);
    setToastOpen(true);
  }, []);

  const uiValue = useMemo(() => ({ showLoader, showToast }), [showLoader, showToast]);

  return (
    <ThemeContext.Provider value={value}>
      <InternalUIContext.Provider value={uiValue}>
        <AppSettingsContext.Provider value={{ ...appSettings, setAppSettings }}>
          <MUIThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <Backdrop open={loading} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar open={toastOpen} autoHideDuration={toastDuration} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
                {toastMessage}
              </Alert>
            </Snackbar>
          </MUIThemeProvider>
        </AppSettingsContext.Provider>
      </InternalUIContext.Provider>
    </ThemeContext.Provider>
  );
};


