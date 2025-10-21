import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Card, Title, Paragraph, useTheme, List, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { clientAPI } from '../../utils/api';

const ClientSettings: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [settings, setSettings] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    payroll: {
      autoProcess: false,
      reminderDays: 3,
    },
    attendance: {
      autoMark: false,
      gracePeriod: 15,
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getSettings();
      if (response.data) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      showLoader(true);
      await clientAPI.updateSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.log('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      showLoader(false);
    }
  };

  const SettingItem = ({ title, subtitle, icon, children }: any) => (
    <List.Item
      title={title}
      description={subtitle}
      left={() => <List.Icon icon={icon} color={theme.colors.primary} />}
      right={() => children}
    />
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>
          Organization Settings
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Manage your organization settings and preferences
        </Paragraph>
      </View>

      {/* Organization Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Organization Information
          </Title>
          <TextInput
            label="Organization Name"
            value={settings.organizationName}
            onChangeText={(text) => setSettings({ ...settings, organizationName: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Email"
            value={settings.email}
            onChangeText={(text) => setSettings({ ...settings, email: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />
          <TextInput
            label="Phone"
            value={settings.phone}
            onChangeText={(text) => setSettings({ ...settings, phone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
          <TextInput
            label="Address"
            value={settings.address}
            onChangeText={(text) => setSettings({ ...settings, address: text })}
            style={styles.input}
            mode="outlined"
            multiline
          />
        </Card.Content>
      </Card>

      {/* System Preferences */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            System Preferences
          </Title>
          <SettingItem
            title="Timezone"
            subtitle="Asia/Kolkata"
            icon="clock"
          >
            <Button mode="outlined" compact>
              Change
            </Button>
          </SettingItem>
          <Divider />
          <SettingItem
            title="Currency"
            subtitle="Indian Rupee (INR)"
            icon="currency-inr"
          >
            <Button mode="outlined" compact>
              Change
            </Button>
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Notification Settings
          </Title>
          <SettingItem
            title="Email Notifications"
            subtitle="Receive notifications via email"
            icon="email"
          >
            <Switch
              value={settings.notifications.email}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Push Notifications"
            subtitle="Receive push notifications"
            icon="bell"
          >
            <Switch
              value={settings.notifications.push}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, push: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="SMS Notifications"
            subtitle="Receive notifications via SMS"
            icon="message-text"
          >
            <Switch
              value={settings.notifications.sms}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, sms: value }
              })}
            />
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Payroll Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Payroll Settings
          </Title>
          <SettingItem
            title="Auto Process Payroll"
            subtitle="Automatically process payroll on schedule"
            icon="cash-multiple"
          >
            <Switch
              value={settings.payroll.autoProcess}
              onValueChange={(value) => setSettings({
                ...settings,
                payroll: { ...settings.payroll, autoProcess: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Reminder Days"
            subtitle={`${settings.payroll.reminderDays} days before payroll`}
            icon="calendar-clock"
          >
            <Button mode="outlined" compact>
              Edit
            </Button>
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Attendance Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Attendance Settings
          </Title>
          <SettingItem
            title="Auto Mark Attendance"
            subtitle="Automatically mark attendance based on location"
            icon="map-marker"
          >
            <Switch
              value={settings.attendance.autoMark}
              onValueChange={(value) => setSettings({
                ...settings,
                attendance: { ...settings.attendance, autoMark: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Grace Period"
            subtitle={`${settings.attendance.gracePeriod} minutes`}
            icon="clock-alert"
          >
            <Button mode="outlined" compact>
              Edit
            </Button>
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Security Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Security Settings
          </Title>
          <SettingItem
            title="Change Password"
            subtitle="Update your account password"
            icon="lock"
          >
            <Button mode="outlined" compact>
              Change
            </Button>
          </SettingItem>
          <Divider />
          <SettingItem
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            icon="shield-check"
          >
            <Button mode="outlined" compact>
              Enable
            </Button>
          </SettingItem>
          <Divider />
          <SettingItem
            title="Session Management"
            subtitle="Manage active sessions"
            icon="account-multiple"
          >
            <Button mode="outlined" compact>
              Manage
            </Button>
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <Button
          mode="contained"
          onPress={handleSaveSettings}
          loading={loading}
          style={styles.saveButton}
        >
          Save Settings
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  saveButtonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default ClientSettings;