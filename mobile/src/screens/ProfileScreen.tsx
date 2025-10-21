import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, TextInput, Button, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import { useUI } from '../contexts/ThemeContext';
import { authAPI } from '../utils/api';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      showLoader(true);
      
      // Use direct API call for profile update
      const response = await authAPI.updateProfile(profileData);
      
      if (response.status >= 200 && response.status < 300) {
        showToast('Profile updated successfully', 'success');
        // Also update Redux state
        const result = await dispatch(updateProfile(profileData) as any);
        if (!updateProfile.fulfilled.match(result)) {
          console.log('Redux state update failed, but API call succeeded');
        }
      } else {
        showToast(response.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.log('Profile update error:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      showLoader(true);
      
      // Use direct API call for password change
      const response = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.status >= 200 && response.status < 300) {
        showToast('Password changed successfully', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
        
        // Also update Redux state
        const result = await dispatch(changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }) as any);
        if (!changePassword.fulfilled.match(result)) {
          console.log('Redux state update failed, but API call succeeded');
        }
      } else {
        showToast(response.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.log('Password change error:', error);
      showToast('Failed to change password', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Title style={[styles.name, { color: theme.colors.onBackground }]}>
          {user?.firstName} {user?.lastName}
        </Title>
        <Paragraph style={[styles.email, { color: theme.colors.onSurface }]}>
          {user?.email}
        </Paragraph>
        <Paragraph style={[styles.role, { color: theme.colors.primary }]}>
          {user?.role?.toUpperCase()}
        </Paragraph>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Profile Information
          </Title>
          
          <TextInput
            label="First Name"
            value={profileData.firstName}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Last Name"
            value={profileData.lastName}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Phone"
            value={profileData.phone}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          
          <TextInput
            label="Email"
            value={user?.email || ''}
            mode="outlined"
            disabled
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            loading={loading}
            disabled={loading}
            style={[styles.updateButton, { backgroundColor: theme.colors.primary }]}
          >
            Update Profile
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Security
          </Title>
          
          {!showPasswordForm ? (
            <Button
              mode="outlined"
              onPress={() => setShowPasswordForm(true)}
              style={styles.passwordButton}
            >
              Change Password
            </Button>
          ) : (
            <>
              <TextInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />
              
              <TextInput
                label="New Password"
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />
              
              <TextInput
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />

              <View style={styles.passwordActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowPasswordForm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  loading={loading}
                  disabled={loading}
                  style={[styles.changeButton, { backgroundColor: theme.colors.primary }]}
                >
                  Change Password
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  passwordButton: {
    marginTop: 8,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  changeButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ProfileScreen;
