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
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  Receipt as ReceiptIcon,
  Work as WorkIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface DashboardStats {
  totalEmployees: number;
  totalContractors: number;
  presentToday: number;
  pendingPayroll: number;
  pendingLeaves: number;
  activeContracts: number;
  monthlyPayroll: number;
  attendanceRate: number;
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
        boxShadow: 4,
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Box sx={{ color, fontSize: 40, mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
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
          {trend !== undefined && (
            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main">
                +{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color, fontSize: 40 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ClientDashboard: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalContractors: 0,
    presentToday: 0,
    pendingPayroll: 0,
    pendingLeaves: 0,
    activeContracts: 0,
    monthlyPayroll: 0,
    attendanceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      showLoader(true);
      const [statsRes, activityRes] = await Promise.all([
        api('/api/client/dashboard'),
        api('/api/client/activities')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Organization Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<PeopleIcon />}
            color="primary.main"
            trend={5.2}
            subtitle="Active employees"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={<CheckCircleIcon />}
            color="success.main"
            trend={2.1}
            subtitle={`${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(stats.monthlyPayroll)}
            icon={<MoneyIcon />}
            color="warning.main"
            trend={8.3}
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<ScheduleIcon />}
            color="info.main"
            trend={1.5}
            subtitle="Average attendance"
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Contractors
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {stats.totalContractors}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active contractors
                  </Typography>
                </Box>
                <Box sx={{ color: 'secondary.main', fontSize: 40 }}>
                  <AssignmentIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Active Contracts
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {stats.activeContracts}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current assignments
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', fontSize: 40 }}>
                  <WorkIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Pending Payroll
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.pendingPayroll}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Items pending
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main', fontSize: 40 }}>
                  <ReceiptIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Pending Leaves
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {stats.pendingLeaves}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Leave requests
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', fontSize: 40 }}>
                  <ScheduleIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
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
                    title="Employee Management"
                    description="Manage employees and their details"
                    icon={<PeopleIcon />}
                    color={theme.palette.primary.main}
                    onClick={() => navigate('/client/employees')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Contractor Management"
                    description="Manage contractors and assignments"
                    icon={<AssignmentIcon />}
                    color={theme.palette.secondary.main}
                    onClick={() => navigate('/client/contractors')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Attendance Management"
                    description="Track and manage attendance"
                    icon={<ScheduleIcon />}
                    color={theme.palette.success.main}
                    onClick={() => navigate('/client/attendance')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Payroll Processing"
                    description="Process monthly payroll"
                    icon={<MoneyIcon />}
                    color={theme.palette.warning.main}
                    onClick={() => navigate('/client/payroll')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Leave Management"
                    description="Manage leave requests"
                    icon={<ScheduleIcon />}
                    color={theme.palette.info.main}
                    onClick={() => navigate('/client/leaves')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Organization Reports"
                    description="View reports and analytics"
                    icon={<AssessmentIcon />}
                    color={theme.palette.grey[600]}
                    onClick={() => navigate('/client/reports')}
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
              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {activity.type === 'user' && <PeopleIcon fontSize="small" />}
                          {activity.type === 'organization' && <BusinessIcon fontSize="small" />}
                          {activity.type === 'contractor' && <AssignmentIcon fontSize="small" />}
                          {activity.type === 'settings' && <SettingsIcon fontSize="small" />}
                          {activity.type === 'system' && <ComputerIcon fontSize="small" />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={new Date(activity.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;