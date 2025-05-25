import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';

export interface ProfileHeaderProps {
  name: string;
  position: string;
  department: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, position, department }) => {
  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label={name.split(' ').map(n => n[0]).join('')} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.position}>{position}</Text>
      <Text style={styles.department}>{department}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  department: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
}); 