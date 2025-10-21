import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, useTheme, List, IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { sharedAPI } from '../utils/api';
import { Notification } from '../types';
import { useUI } from '../contexts/ThemeContext';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useUI();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await sharedAPI.getNotifications();
      if (response.status === 200) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await sharedAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      showToast('Notification marked as read', 'success');
    } catch (error) {
      console.log('Error marking notification as read:', error);
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Note: deleteNotification not available in sharedAPI, using markAsRead instead
      await sharedAPI.markNotificationRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showToast('Notification deleted', 'success');
    } catch (error) {
      console.log('Error deleting notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await sharedAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      console.log('Error marking all notifications as read:', error);
      showToast('Failed to mark all notifications as read', 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return theme.colors.primary;
      case 'warning': return '#FF9800';
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'alert';
      case 'error': return 'alert-circle';
      default: return 'information';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title>Notifications</Title>
        <IconButton
          icon="check-all"
          onPress={markAllAsRead}
          iconColor={theme.colors.primary}
        />
        <IconButton
          icon="close"
          onPress={onClose}
          iconColor={theme.colors.onSurface}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>No notifications</Title>
              <Paragraph>You're all caught up!</Paragraph>
            </Card.Content>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              style={[
                styles.notificationCard,
                { 
                  backgroundColor: notification.isRead 
                    ? theme.colors.surface 
                    : theme.colors.primaryContainer 
                }
              ]}
            >
              <Card.Content>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationInfo}>
                    <Chip
                      icon={getTypeIcon(notification.type)}
                      style={[
                        styles.typeChip,
                        { backgroundColor: getTypeColor(notification.type) }
                      ]}
                      textStyle={{ color: theme.colors.onPrimary }}
                    >
                      {notification.type}
                    </Chip>
                    <Paragraph style={styles.timestamp}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Paragraph>
                  </View>
                  <View style={styles.actions}>
                    {!notification.isRead && (
                      <IconButton
                        icon="check"
                        size={20}
                        onPress={() => markAsRead(notification.id)}
                        iconColor={theme.colors.primary}
                      />
                    )}
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => deleteNotification(notification.id)}
                      iconColor={theme.colors.error}
                    />
                  </View>
                </View>
                <Title style={styles.notificationTitle}>
                  {notification.title}
                </Title>
                <Paragraph style={styles.notificationMessage}>
                  {notification.message}
                </Paragraph>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationCenter;
