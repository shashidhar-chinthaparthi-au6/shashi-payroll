import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { login } from '../store/slices/authSlice';
import { useUI } from '../contexts/ThemeContext';
import STATUS from '../constants/statusCodes';
import MSG from '../constants/messages';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      showLoader(true);
      console.log('🔐 Starting login process...');
      
      // Use Redux action for login (which handles API calls internally)
      const result = await dispatch(login({ email, password }) as any);
      
      if (login.fulfilled.match(result)) {
        console.log('🔐 Login successful:', result.payload);
        showToast(MSG.AUTH_LOGIN_SUCCESS, 'success');
        // Navigation will be handled by the auth state change
      } else {
        console.log('🔐 Login failed:', result.payload);
        showToast(result.payload || MSG.AUTH_INVALID_CREDENTIALS, 'error');
      }
    } catch (error) {
      console.log('🔐 Login error:', error);
      showToast(MSG.AUTH_INVALID_CREDENTIALS, 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.content}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>
              Welcome Back
            </Title>
            <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
              Sign in to your account
            </Paragraph>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!error}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!error}
            />

            {error && (
              <Paragraph style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Paragraph>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => {/* Handle forgot password */}}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
