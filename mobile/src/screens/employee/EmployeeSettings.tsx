import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Card, Title, Paragraph, useTheme, List, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { employeeAPI } from '../../utils/api';

const EmployeeSettings: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      department: '',
      position: '',
      employeeId: '',
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      attendanceReminders: true,
      leaveUpdates: true,
      payslipNotifications: true,
    },
    attendance: {
      autoCheckIn: false,
      locationTracking: false,
      breakReminders: true,
      overtimeAlerts: true,
      gracePeriod: 15,
    },
    privacy: {
      shareLocation: false,
      shareContact: true,
      profileVisibility: 'colleagues',
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getSettings();
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
      await employeeAPI.updateSettings(settings);
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
          Settings
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Manage your account and preferences
        </Paragraph>
      </View>

      {/* Profile Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Profile Information
          </Title>
          <TextInput
            label="First Name"
            value={settings.profile.firstName}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, firstName: text }
            })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Last Name"
            value={settings.profile.lastName}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, lastName: text }
            })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Email"
            value={settings.profile.email}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, email: text }
            })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />
          <TextInput
            label="Phone"
            value={settings.profile.phone}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, phone: text }
            })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
          <TextInput
            label="Address"
            value={settings.profile.address}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, address: text }
            })}
            style={styles.input}
            mode="outlined"
            multiline
          />
          <TextInput
            label="Department"
            value={settings.profile.department}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, department: text }
            })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Position"
            value={settings.profile.position}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, position: text }
            })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Employee ID"
            value={settings.profile.employeeId}
            onChangeText={(text) => setSettings({
              ...settings,
              profile: { ...settings.profile, employeeId: text }
            })}
            style={styles.input}
            mode="outlined"
          />
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
          <Divider />
          <SettingItem
            title="Attendance Reminders"
            subtitle="Get reminded about check-in/out"
            icon="clock"
          >
            <Switch
              value={settings.notifications.attendanceReminders}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, attendanceReminders: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Leave Updates"
            subtitle="Get notified about leave status"
            icon="calendar"
          >
            <Switch
              value={settings.notifications.leaveUpdates}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, leaveUpdates: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Payslip Notifications"
            subtitle="Get notified when payslips are ready"
            icon="file-document"
          >
            <Switch
              value={settings.notifications.payslipNotifications}
              onValueChange={(value) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, payslipNotifications: value }
              })}
            />
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
            title="Auto Check-in"
            subtitle="Automatically check in when you arrive at work"
            icon="map-marker"
          >
            <Switch
              value={settings.attendance.autoCheckIn}
              onValueChange={(value) => setSettings({
                ...settings,
                attendance: { ...settings.attendance, autoCheckIn: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Location Tracking"
            subtitle="Allow location tracking for attendance"
            icon="crosshairs-gps"
          >
            <Switch
              value={settings.attendance.locationTracking}
              onValueChange={(value) => setSettings({
                ...settings,
                attendance: { ...settings.attendance, locationTracking: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Break Reminders"
            subtitle="Get reminded to take breaks"
            icon="clock-alert"
          >
            <Switch
              value={settings.attendance.breakReminders}
              onValueChange={(value) => setSettings({
                ...settings,
                attendance: { ...settings.attendance, breakReminders: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Overtime Alerts"
            subtitle="Get notified when working overtime"
            icon="clock-out"
          >
            <Switch
              value={settings.attendance.overtimeAlerts}
              onValueChange={(value) => setSettings({
                ...settings,
                attendance: { ...settings.attendance, overtimeAlerts: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Grace Period"
            subtitle={`${settings.attendance.gracePeriod} minutes`}
            icon="clock-fast"
          >
            <Button mode="outlined" compact>
              Edit
            </Button>
          </SettingItem>
        </Card.Content>
      </Card>

      {/* Privacy Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Privacy Settings
          </Title>
          <SettingItem
            title="Share Location"
            subtitle="Allow sharing your work location"
            icon="map"
          >
            <Switch
              value={settings.privacy.shareLocation}
              onValueChange={(value) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, shareLocation: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Share Contact"
            subtitle="Allow sharing your contact information"
            icon="account"
          >
            <Switch
              value={settings.privacy.shareContact}
              onValueChange={(value) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, shareContact: value }
              })}
            />
          </SettingItem>
          <Divider />
          <SettingItem
            title="Profile Visibility"
            subtitle="Control who can see your profile"
            icon="eye"
          >
            <Button mode="outlined" compact>
              {settings.privacy.profileVisibility}
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

export default EmployeeSettings;