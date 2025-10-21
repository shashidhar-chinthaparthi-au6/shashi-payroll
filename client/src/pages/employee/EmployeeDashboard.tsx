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
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
  Event as EventIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  todayStatus: 'present' | 'absent' | 'late' | 'not_checked';
  workingHours: number;
  monthlyPayslips: number;
  pendingLeaves: number;
  totalLeaves: number;
  nextPayslip: string;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'payslip' | 'leave' | 'profile';
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayStatus: 'not_checked',
    workingHours: 0,
    monthlyPayslips: 0,
    pendingLeaves: 0,
    totalLeaves: 0,
    nextPayslip: '',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      showLoader(true);
      const resp = await api('/api/employee/dashboard');
      const data = resp?.data || {};

      setStats({
        todayStatus: data.todayStatus || 'not_checked',
        workingHours: data.workingHours ?? 0,
        monthlyPayslips: data.monthlyPayslips ?? 0,
        pendingLeaves: data.pendingLeaves ?? 0,
        totalLeaves: data.totalLeaves ?? 0,
        nextPayslip: data.nextPayslip ?? '',
      });

      setRecentActivity([
        {
          id: '1',
          type: 'attendance',
          action: 'Data loaded',
          timestamp: 'Just now',
          status: 'success',
        },
      ]);

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

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'not_checked':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAttendanceStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'not_checked':
        return 'Not Checked';
      default:
        return 'Unknown';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
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
        Employee Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Today's Status"
            value={getAttendanceStatusText(stats.todayStatus)}
            icon={<AccessTimeIcon />}
            color={
              getAttendanceStatusColor(stats.todayStatus) === 'success' ? theme.palette.success.main :
              getAttendanceStatusColor(stats.todayStatus) === 'error' ? theme.palette.error.main :
              getAttendanceStatusColor(stats.todayStatus) === 'warning' ? theme.palette.warning.main :
              theme.palette.grey[500]
            }
            subtitle="Attendance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Working Hours"
            value={`${stats.workingHours}h`}
            icon={<AccessTimeIcon />}
            color={theme.palette.primary.main}
            subtitle="Today"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Payslips"
            value={stats.monthlyPayslips}
            icon={<ReceiptIcon />}
            color={theme.palette.success.main}
            subtitle="This Year"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<EventIcon />}
            color={theme.palette.warning.main}
            subtitle="Applications"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Leaves"
            value={stats.totalLeaves}
            icon={<EventIcon />}
            color={theme.palette.info.main}
            subtitle="This Year"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Next Payslip"
            value={stats.nextPayslip}
            icon={<ReceiptIcon />}
            color={theme.palette.secondary.main}
            subtitle="Expected"
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
                    title="Mark Attendance"
                    description="Check in/out for today"
                    icon={<QrCodeIcon />}
                    color={theme.palette.primary.main}
                    onClick={() => navigate('/employee/mark-attendance')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="View Payslips"
                    description="Download and view payslips"
                    icon={<ReceiptIcon />}
                    color={theme.palette.success.main}
                    onClick={() => navigate('/employee/payslips')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Apply Leave"
                    description="Submit leave application"
                    icon={<EventIcon />}
                    color={theme.palette.warning.main}
                    onClick={() => navigate('/employee/apply-leave')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="View Profile"
                    description="View and edit profile"
                    icon={<PersonIcon />}
                    color={theme.palette.info.main}
                    onClick={() => navigate('/employee/profile')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Attendance History"
                    description="View attendance records"
                    icon={<HistoryIcon />}
                    color={theme.palette.secondary.main}
                    onClick={() => navigate('/employee/attendance')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Leave History"
                    description="View leave applications"
                    icon={<EventIcon />}
                    color={theme.palette.grey[600]}
                    onClick={() => navigate('/employee/apply-leave')}
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

export default EmployeeDashboard;