import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Button,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useUI } from '../contexts/ThemeContext';
import api from '../utils/api';
import STATUS from '../constants/statusCodes';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  priority: string;
  category: string;
  actionUrl?: string;
  createdAt: string;
  sender?: {
    name: string;
    email: string;
  };
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api('/api/notifications');
      
      if (response.status === STATUS.OK) {
        setNotifications(response.data || []);
        setUnreadCount(response.data?.filter((n: Notification) => !n.isRead).length || 0);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

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
    if (open) {
      fetchNotifications();
    } else {
      fetchUnreadCount();
    }
  }, [open, fetchNotifications, fetchUnreadCount]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };


  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await api(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.status === STATUS.OK) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      showLoader(true);
      const response = await api('/api/notifications/read-all', {
        method: 'PUT'
      });
      
      if (response.status === STATUS.OK) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to mark all notifications as read', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await api(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.status === STATUS.OK) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete notification', 'error');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box>
            <Button
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                  border: notification.isRead ? 'none' : `1px solid ${theme.palette.primary.main}20`
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getCategoryColor(notification.category)}.main` }}>
                    {getCategoryIcon(notification.category)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                        {notification.title}
                      </Typography>
                      {notification.priority === 'urgent' && (
                        <Chip label="Urgent" color="error" size="small" />
                      )}
                      {notification.priority === 'high' && (
                        <Chip label="High" color="warning" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {!notification.isRead && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <MarkEmailReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(notification._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationCenter;
