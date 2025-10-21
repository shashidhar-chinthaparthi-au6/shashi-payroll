import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  Monitor as MonitorIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalContractors: number;
  activeContracts: number;
  pendingApprovals: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: 'organization' | 'user' | 'contract' | 'system';
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalContractors: 0,
    activeContracts: 0,
    pendingApprovals: 0,
    systemHealth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      showLoader(true);
      const [resp, act] = await Promise.all([
        api('/api/admin/dashboard'),
        api('/api/admin/activities')
      ]);
      const data = resp?.data || {};

      setStats({
        totalOrganizations: data.totalOrganizations ?? 0,
        totalUsers: data.totalUsers ?? 0,
        totalContractors: data.totalContractors ?? 0,
        activeContracts: data.activeContracts ?? 0,
        pendingApprovals: data.pendingApprovals ?? 0,
        systemHealth: data.systemHealth ?? 0,
      });

      const items = (act?.data || []).map((a: any, idx: number) => ({
        id: a._id || String(idx),
        type: a.type as any,
        action: a.action,
        timestamp: new Date(a.createdAt).toLocaleString(),
        status: 'success' as const,
      }));
      setRecentActivity(items);

      showToast('Dashboard data loaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to load dashboard data', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  }, [showLoader, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <CheckCircleIcon color="success" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'success';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    onClick?: () => void;
    clickable?: boolean;
  }> = ({ title, value, icon, color, subtitle, onClick, clickable }) => (
    <Card 
      sx={{ 
        height: '100%', 
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': clickable ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {}
      }}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
  }> = ({ title, description, icon, color, onClick }) => (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[6],
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar sx={{ backgroundColor: color, width: 56, height: 56, mx: 'auto', mb: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant="indeterminate" />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Super Admin Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Organizations"
            value={stats.totalOrganizations}
            icon={<BusinessIcon />}
            color={theme.palette.primary.main}
            subtitle="Active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.success.main}
            subtitle="Total"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Contractors"
            value={stats.totalContractors}
            icon={<AssignmentIcon />}
            color={theme.palette.warning.main}
            subtitle="Active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Active Contracts"
            value={stats.activeContracts}
            icon={<AssignmentIcon />}
            color={theme.palette.info.main}
            subtitle="Running"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Pending"
            value={stats.pendingApprovals}
            icon={<WarningIcon />}
            color={stats.pendingApprovals > 0 ? theme.palette.error.main : theme.palette.success.main}
            subtitle="Approvals"
            onClick={() => navigate('/admin/approvals')}
            clickable
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={<TrendingUpIcon />}
            color={stats.systemHealth >= 90 ? theme.palette.success.main : 
                   stats.systemHealth >= 70 ? theme.palette.warning.main : theme.palette.error.main}
            subtitle="Status"
            onClick={() => navigate('/admin/health')}
            clickable
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Organization Management"
                    description="Create and manage organizations"
                    icon={<BusinessIcon />}
                    color={theme.palette.primary.main}
                    onClick={() => navigate('/admin/organizations')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="User Management"
                    description="Manage users and permissions"
                    icon={<PeopleIcon />}
                    color={theme.palette.success.main}
                    onClick={() => navigate('/admin/users')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Contractor Management"
                    description="Manage contractors and assignments"
                    icon={<AssignmentIcon />}
                    color={theme.palette.warning.main}
                    onClick={() => navigate('/admin/contractors')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Contract Assignment"
                    description="Assign contractors to organizations"
                    icon={<AssignmentIcon />}
                    color={theme.palette.info.main}
                    onClick={() => navigate('/admin/contracts')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Global Analytics"
                    description="View system-wide analytics"
                    icon={<TrendingUpIcon />}
                    color={theme.palette.secondary.main}
                    onClick={() => navigate('/admin/analytics')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="System Settings"
                    description="Configure system settings"
                    icon={<SettingsIcon />}
                    color={theme.palette.grey[600]}
                    onClick={() => navigate('/admin/settings')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Advanced Reports"
                    description="Generate detailed reports and analytics"
                    icon={<AssessmentIcon />}
                    color={theme.palette.secondary.main}
                    onClick={() => navigate('/admin/reports')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="System Monitoring"
                    description="Monitor system health and performance"
                    icon={<MonitorIcon />}
                    color={theme.palette.error.main}
                    onClick={() => navigate('/admin/monitoring')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={activity.type}
                              size="small"
                              color={getStatusColor(activity.status) as any}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;