import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  List,
  Switch,
  Divider,
  Button,
  Dialog,
  Portal,
  Text,
  Card,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { authAPI } from '../../services/api';

type SettingsStackParamList = {
  SettingsMain: undefined;
  ChangePassword: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword(currentPassword, newPassword);
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    try {
      // TODO: Implement support contact functionality
      setSupportVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contact support');
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    try {
      setNotifications(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
    }
  };

  const handleToggleDarkMode = (value: boolean) => {
    try {
      setDarkMode(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme settings');
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => setError(null)}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <List.Item
            title="Push Notifications"
            description="Receive updates about your documents and account"
            right={() => (
              <Switch
                value={notifications}
                onValueChange={handleToggleNotifications}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Appearance" />
        <Card.Content>
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark theme"
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Account" />
        <Card.Content>
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={(props: { color: string; style: any }) => (
              <List.Icon {...props} icon="lock" />
            )}
            onPress={() => setChangePasswordVisible(true)}
          />
          <Divider />
          <List.Item
            title="Contact Support"
            description="Get help with your account"
            left={(props: { color: string; style: any }) => (
              <List.Icon {...props} icon="help-circle" />
            )}
            onPress={() => setSupportVisible(true)}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="About" />
        <Card.Content>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props: { color: string; style: any }) => (
              <List.Icon {...props} icon="information" />
            )}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props: { color: string; style: any }) => (
              <List.Icon {...props} icon="file-document" />
            )}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props: { color: string; style: any }) => (
              <List.Icon {...props} icon="shield-account" />
            )}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={changePasswordVisible}
          onDismiss={() => {
            setChangePasswordVisible(false);
            setPasswordError(null);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
        >
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            {passwordError && (
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>
            )}
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              error={!!passwordError}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              error={!!passwordError}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              error={!!passwordError}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setChangePasswordVisible(false);
              setPasswordError(null);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}>
              Cancel
            </Button>
            <Button 
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
            >
              Change
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={supportVisible}
          onDismiss={() => setSupportVisible(false)}
        >
          <Dialog.Title>Contact Support</Dialog.Title>
          <Dialog.Content>
            <Text>Support contact functionality will be implemented here.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSupportVisible(false)}>Close</Button>
            <Button onPress={handleContactSupport}>Send</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
}); 