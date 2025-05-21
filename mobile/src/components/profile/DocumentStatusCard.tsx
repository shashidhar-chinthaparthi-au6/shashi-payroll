import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

interface DocumentStatusCardProps {
  title: string;
  status: DocumentStatus;
  onUpload?: () => void;
  onPreview?: () => void;
}

export const DocumentStatusCard: React.FC<DocumentStatusCardProps> = ({
  title,
  status,
  onUpload,
  onPreview,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#FFC107';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'clock-outline';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <IconButton
            icon={getStatusIcon()}
            size={24}
            iconColor={getStatusColor()}
          />
        </View>
        <View style={styles.actions}>
          {status === 'pending' && (
            <IconButton
              icon="upload"
              size={24}
              onPress={onUpload}
              mode="contained"
            />
          )}
          {status !== 'pending' && (
            <IconButton
              icon="eye"
              size={24}
              onPress={onPreview}
              mode="contained"
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
}); 