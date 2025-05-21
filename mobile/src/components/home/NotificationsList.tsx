import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
};

type Props = {
  notifications: Notification[];
};

const NotificationsList = ({ notifications }: Props) => {
  const getIconName = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert';
      case 'error':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <Icon
        name={getIconName(item.type)}
        size={24}
        color={getIconColor(item.type)}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationsList; 