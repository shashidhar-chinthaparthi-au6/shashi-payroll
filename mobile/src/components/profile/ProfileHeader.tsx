import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

interface ProfileHeaderProps {
  name: string;
  position: string;
  employeeId: string;
  profileImage?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  position,
  employeeId,
  profileImage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <Avatar.Text size={80} label={name.split(' ').map(n => n[0]).join('')} />
        )}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.position}>{position}</Text>
        <Text style={styles.employeeId}>ID: {employeeId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  detailsContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    color: '#888',
  },
}); 