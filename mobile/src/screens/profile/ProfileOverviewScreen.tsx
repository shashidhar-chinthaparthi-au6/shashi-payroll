import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { DocumentStatusCard, DocumentStatus } from '../../components/profile/DocumentStatusCard';

export const ProfileOverviewScreen: React.FC = () => {
  const handleLogout = () => {
    // TODO: Implement logout functionality
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
  };

  const documents: Array<{ title: string; status: DocumentStatus }> = [
    { title: 'ID Proof', status: 'verified' },
    { title: 'Address Proof', status: 'pending' },
    { title: 'Educational Certificates', status: 'rejected' },
  ];

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader
        name="John Doe"
        position="Software Engineer"
        employeeId="EMP001"
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
                Joined: Jan 2023
              </Button>
            </View>
            <View style={styles.infoItem}>
              <Button
                icon="office-building"
                mode="text"
                onPress={() => {}}
                style={styles.infoButton}
              >
                Department: Engineering
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Document Verification" />
        <Card.Content>
          {documents.map((doc, index) => (
            <DocumentStatusCard
              key={index}
              title={doc.title}
              status={doc.status}
              onUpload={() => {}}
              onPreview={() => {}}
            />
          ))}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="cog"
          onPress={handleSettings}
          style={styles.button}
        >
          Account Settings
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
}); 