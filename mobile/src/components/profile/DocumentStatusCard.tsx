import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

interface DocumentStatusCardProps {
  title: string;
  status: DocumentStatus | 'not_uploaded';
  onUpload: () => void;
  onPreview: () => void;
  onDownload?: () => void;
  required?: boolean;
}

export const DocumentStatusCard: React.FC<DocumentStatusCardProps> = ({
  title,
  status,
  onUpload,
  onPreview,
  onDownload,
  required = false,
}) => {
  // Title color based on status
  const getTitleColor = () => {
    switch (status) {
      case 'verified':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'pending':
        return '#FFA000'; // Orange
      case 'not_uploaded':
      default:
        return '#888'; // Gray
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: getTitleColor() }]}>{title}</Text>
          {required && status === 'not_uploaded' && (
            <Text style={styles.required}>Required</Text>
          )}
        </View>
        <View style={styles.actionsContainer}>
          {status !== 'not_uploaded' && (
            <TouchableOpacity onPress={onPreview} style={styles.iconButton}>
              <MaterialCommunityIcons name="eye" size={24} color="#6200ee" />
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        {status === 'not_uploaded' ? (
          <Button mode="contained" onPress={onUpload}>
            Upload
          </Button>
        ) : (
          <Button mode="contained" onPress={onUpload}>
            Update
          </Button>
        )}
        {status !== 'not_uploaded' && onDownload && (
          <Button mode="outlined" onPress={onDownload}>
            Download
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  required: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 8,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
}); 