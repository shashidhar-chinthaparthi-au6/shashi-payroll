import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import api from '../utils/api';
import STATUS from '../constants/statusCodes';

interface NotificationBellProps {
  onOpenNotifications: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onOpenNotifications }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api('/api/notifications/count');
      
      if (response.status === STATUS.OK) {
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (e: any) {
      console.error('Failed to fetch unread count:', e);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Tooltip title="Notifications">
      <IconButton
        color="inherit"
        onClick={onOpenNotifications}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
