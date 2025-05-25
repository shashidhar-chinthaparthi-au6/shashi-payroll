import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Card, TextInput, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { useDispatch } from 'react-redux';
import { logout, clearAuth } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { profileAPI } from '../../services/api';

interface ProfileData {
  name: string;
  position: string;
  department: string;
  joinDate: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

interface EditedProfileData {
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

export const ProfileOverviewScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditedProfileData>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileResponse = await profileAPI.getProfile();
      setProfile(profileResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await dispatch(logout()).unwrap();
      dispatch(clearAuth());
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearAuth());
    }
  };

  const handleEditProfile = () => {
    setEditedProfile({
      phone: profile?.phone || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact ? {
        name: profile.emergencyContact.name,
        relationship: profile.emergencyContact.relationship,
        phone: profile.emergencyContact.phone
      } : {
        name: '',
        relationship: '',
        phone: ''
      },
      bankDetails: profile?.bankDetails ? {
        accountNumber: profile.bankDetails.accountNumber,
        bankName: profile.bankDetails.bankName,
        ifscCode: profile.bankDetails.ifscCode
      } : {
        accountNumber: '',
        bankName: '',
        ifscCode: ''
      }
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.updateProfile(editedProfile);
      setProfile(response.data);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader
        name={profile?.name || ''}
        position={profile?.position || ''}
        department={profile?.department || ''}
      />

      <Card style={styles.section}>
        <Card.Title title="Employment Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Button
                icon="calendar"
                mode="text"
                onPress={() => {}}
                style={styles.infoButton}
              >
                Joined: {new Date(profile?.joinDate || '').toLocaleDateString()}
              </Button>
            </View>
            <View style={styles.infoItem}>
              <Button
                icon="office-building"
                mode="text"
                onPress={() => {}}
                style={styles.infoButton}
              >
                Department: {profile?.department}
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Contact Information" />
        <Card.Content>
          <Button
            icon="phone"
            mode="text"
            onPress={() => {}}
            style={styles.infoButton}
          >
            Phone: {profile?.phone || 'Not provided'}
          </Button>
          <Button
            icon="map-marker"
            mode="text"
            onPress={() => {}}
            style={styles.infoButton}
          >
            Address: {profile?.address || 'Not provided'}
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="account-edit"
          onPress={handleEditProfile}
          style={styles.button}
        >
          Edit Profile
        </Button>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.button}
        >
          Logout
        </Button>
      </View>

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <TextInput
              label="Phone"
              value={editedProfile.phone}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
              style={styles.input}
            />
            <TextInput
              label="Address"
              value={editedProfile.address}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, address: text })}
              style={styles.input}
              multiline
            />
            <TextInput
              label="Emergency Contact Name"
              value={editedProfile.emergencyContact?.name || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                emergencyContact: {
                  ...editedProfile.emergencyContact,
                  name: text,
                  relationship: editedProfile.emergencyContact?.relationship || '',
                  phone: editedProfile.emergencyContact?.phone || ''
                }
              })}
              style={styles.input}
            />
            <TextInput
              label="Emergency Contact Relationship"
              value={editedProfile.emergencyContact?.relationship || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                emergencyContact: {
                  ...editedProfile.emergencyContact,
                  name: editedProfile.emergencyContact?.name || '',
                  relationship: text,
                  phone: editedProfile.emergencyContact?.phone || ''
                }
              })}
              style={styles.input}
            />
            <TextInput
              label="Emergency Contact Phone"
              value={editedProfile.emergencyContact?.phone || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                emergencyContact: {
                  ...editedProfile.emergencyContact,
                  name: editedProfile.emergencyContact?.name || '',
                  relationship: editedProfile.emergencyContact?.relationship || '',
                  phone: text
                }
              })}
              style={styles.input}
            />
            <TextInput
              label="Bank Account Number"
              value={editedProfile.bankDetails?.accountNumber || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                bankDetails: {
                  ...editedProfile.bankDetails,
                  accountNumber: text,
                  bankName: editedProfile.bankDetails?.bankName || '',
                  ifscCode: editedProfile.bankDetails?.ifscCode || ''
                }
              })}
              style={styles.input}
            />
            <TextInput
              label="Bank Name"
              value={editedProfile.bankDetails?.bankName || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                bankDetails: {
                  ...editedProfile.bankDetails,
                  accountNumber: editedProfile.bankDetails?.accountNumber || '',
                  bankName: text,
                  ifscCode: editedProfile.bankDetails?.ifscCode || ''
                }
              })}
              style={styles.input}
            />
            <TextInput
              label="IFSC Code"
              value={editedProfile.bankDetails?.ifscCode || ''}
              onChangeText={(text) => setEditedProfile({
                ...editedProfile,
                bankDetails: {
                  ...editedProfile.bankDetails,
                  accountNumber: editedProfile.bankDetails?.accountNumber || '',
                  bankName: editedProfile.bankDetails?.bankName || '',
                  ifscCode: text
                }
              })}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.button}
            >
              Save Changes
            </Button>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.button}
            >
              Cancel
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoButton: {
    justifyContent: 'flex-start',
  },
  actions: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
}); 