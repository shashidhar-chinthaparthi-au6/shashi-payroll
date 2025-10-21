import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface HealthMetrics {
  overall: number;
  employeeHealth: number;
  activityHealth: number;
  systemUptime: number;
  databaseStatus: string;
  serverStatus: string;
  lastBackup: string;
  activeUsers: number;
  totalUsers: number;
  recentErrors: number;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
}

const SystemHealth: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    overall: 0,
    employeeHealth: 0,
    activityHealth: 0,
    systemUptime: 0,
    databaseStatus: 'unknown',
    serverStatus: 'unknown',
    lastBackup: '',
    activeUsers: 0,
    totalUsers: 0,
    recentErrors: 0,
  });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHealthData = async () => {
    try {
      showLoader(true);
      const res = await api('/api/admin/system-health');
      setMetrics(res?.data?.metrics || metrics);
      setHealthChecks(res?.data?.healthChecks || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load system health', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const getHealthIcon = (value: number) => {
    if (value >= 90) return <HealthyIcon color="success" />;
    if (value >= 70) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading system health...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        System Health Dashboard
      </Typography>

      {/* Overall Health Alert */}
      <Alert 
        severity={metrics.overall >= 90 ? 'success' : metrics.overall >= 70 ? 'warning' : 'error'}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">
          Overall System Health: {metrics.overall}%
        </Typography>
        <Typography variant="body2">
          {metrics.overall >= 90 ? 'System is running optimally' :
           metrics.overall >= 70 ? 'System is running with minor issues' :
           'System requires attention'}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Employee Health"
                    secondary={`${metrics.employeeHealth}% active employees`}
                  />
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.employeeHealth || 0} 
                    color={getHealthColor(metrics.employeeHealth) as any}
                    sx={{ width: 100 }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Activity Health"
                    secondary={`${metrics.activityHealth}% recent activity`}
                  />
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.activityHealth || 0} 
                    color={getHealthColor(metrics.activityHealth) as any}
                    sx={{ width: 100 }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Uptime"
                    secondary={`${metrics.systemUptime}% uptime`}
                  />
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.systemUptime || 0} 
                    color={getHealthColor(metrics.systemUptime) as any}
                    sx={{ width: 100 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Database"
                    secondary={metrics.databaseStatus}
                  />
                  <Chip 
                    label={metrics.databaseStatus.toUpperCase()} 
                    color={getHealthColor(metrics.databaseStatus === 'connected' ? 100 : 0) as any}
                    size="small"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Server"
                    secondary={metrics.serverStatus}
                  />
                  <Chip 
                    label={metrics.serverStatus.toUpperCase()} 
                    color={getHealthColor(metrics.serverStatus === 'running' ? 100 : 0) as any}
                    size="small"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Active Users"
                    secondary={`${metrics.activeUsers} / ${metrics.totalUsers}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Recent Errors"
                    secondary={`${metrics.recentErrors} errors in last 24h`}
                  />
                  <Chip 
                    label={metrics.recentErrors === 0 ? 'NONE' : 'ERRORS'} 
                    color={metrics.recentErrors === 0 ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Checks */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Checks
              </Typography>
              <List>
                {healthChecks.map((check, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {getHealthIcon(check.status === 'healthy' ? 100 : check.status === 'warning' ? 75 : 25)}
                      </ListItemIcon>
                      <ListItemText
                        primary={check.name}
                        secondary={check.message}
                      />
                      <Chip 
                        label={check.status.toUpperCase()} 
                        color={getStatusColor(check.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < healthChecks.length - 1 && <Divider />}
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

export default SystemHealth;
