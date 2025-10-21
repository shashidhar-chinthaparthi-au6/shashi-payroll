import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Badge, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { sharedAPI } from '../utils/api';
import { Notification } from '../types';

interface NotificationBellProps {
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onPress }) => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await sharedAPI.getNotifications();
      if (response.status === 200) {
        setNotifications(response.data);
        const unread = response.data.filter((n: Notification) => !n.isRead);
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="bell"
        size={24}
        iconColor={theme.colors.onPrimary}
        onPress={handlePress}
      />
      {unreadCount > 0 && (
        <Badge
          style={[styles.badge, { backgroundColor: theme.colors.error }]}
          size={20}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default NotificationBell;
