import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  useTheme,
  Paper
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
  Event as EventIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import STATUS from '../../constants/statusCodes';
import MSG from '../../constants/messages';

interface ContractorStats {
  totalContracts: number;
  activeContracts: number;
  totalEarnings: number;
  pendingInvoices: number;
  totalHours: number;
  attendanceRate: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  action: string;
  actorName: string;
  createdAt: string;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      cursor: 'pointer', 
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-4px)', 
        boxShadow: 4 
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Avatar sx={{ width: 56, height: 56, bgcolor: color, mx: 'auto', mb: 2 }}>
        {icon}
      </Avatar>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const ContractorDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showLoader, showToast } = useUI();
  
  const [stats, setStats] = useState<ContractorStats>({
    totalContracts: 0,
    activeContracts: 0,
    totalEarnings: 0,
    pendingInvoices: 0,
    totalHours: 0,
    attendanceRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      showLoader(true);
      const [statsRes, activityRes] = await Promise.all([
        api('/api/contractor/dashboard'),
        api('/api/contractor/activities')
      ]);
      
      setStats(statsRes?.data || stats);
      setRecentActivity(activityRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load dashboard data', 'error');
    } finally {
      showLoader(false);
    }
  }, [showLoader, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Check in/out for work',
      icon: <AccessTimeIcon />,
      color: theme.palette.primary.main,
      onClick: () => navigate('/contractor/mark-attendance')
    },
    {
      title: 'View Invoices',
      description: 'Check your invoices',
      icon: <ReceiptIcon />,
      color: theme.palette.success.main,
      onClick: () => navigate('/contractor/invoices')
    },
    {
      title: 'Apply Leave',
      description: 'Request time off',
      icon: <EventIcon />,
      color: theme.palette.warning.main,
      onClick: () => navigate('/contractor/apply-leave')
    },
    {
      title: 'View Profile',
      description: 'Manage your profile',
      icon: <PersonIcon />,
      color: theme.palette.info.main,
      onClick: () => navigate('/contractor/profile')
    },
    {
      title: 'Attendance History',
      description: 'View your attendance',
      icon: <HistoryIcon />,
      color: theme.palette.grey[600],
      onClick: () => navigate('/contractor/attendance')
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Contractor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your contracts, attendance, and invoices
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {stats.totalContracts}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Contracts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {stats.activeContracts}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Contracts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  ${stats.totalEarnings.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {stats.pendingInvoices}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {stats.totalHours}h
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {stats.attendanceRate}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {recentActivity.length > 0 ? (
                <List>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity._id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {activity.type === 'contract' && <AssignmentIcon fontSize="small" />}
                          {activity.type === 'attendance' && <AccessTimeIcon fontSize="small" />}
                          {activity.type === 'invoice' && <ReceiptIcon fontSize="small" />}
                          {activity.type === 'leave' && <EventIcon fontSize="small" />}
                          {activity.type === 'profile' && <PersonIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.action}
                        secondary={new Date(activity.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
                <Typography variant="h6">
                  {stats.totalHours} hours worked
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Earnings
                </Typography>
                <Typography variant="h6">
                  ${stats.totalEarnings.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Attendance Rate
                </Typography>
                <Typography variant="h6">
                  {stats.attendanceRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractorDashboard;
