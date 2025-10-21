import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  responseTime: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  throughput: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  database: 'healthy' | 'warning' | 'critical';
  server: 'healthy' | 'warning' | 'critical';
  network: 'healthy' | 'warning' | 'critical';
  security: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface PerformanceLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userAgent: string;
  ip: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  resolved: boolean;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
  status?: 'healthy' | 'warning' | 'critical';
}> = ({ title, value, icon, color, trend, subtitle, status }) => (
  <Card sx={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
    {status && (
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: status === 'healthy' ? 'success.main' : status === 'warning' ? 'warning.main' : 'error.main'
        }}
      />
    )}
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
              {trend > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
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

const SystemMonitoring: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    responseTime: 0,
    activeUsers: 0,
    totalRequests: 0,
    errorRate: 0,
    throughput: 0
  });
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    database: 'healthy',
    server: 'healthy',
    network: 'healthy',
    security: 'healthy',
    lastChecked: new Date().toISOString()
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [metricsRes, healthRes, alertsRes, logsRes, securityRes] = await Promise.all([
        api('/api/admin/system-metrics'),
        api('/api/admin/system-health'),
        api('/api/admin/system-alerts'),
        api('/api/admin/performance-logs'),
        api('/api/admin/security-events')
      ]);
      
      setMetrics(metricsRes?.data || metrics);
      setHealth(healthRes?.data || {
        overall: 'healthy',
        database: 'healthy',
        server: 'healthy',
        network: 'healthy',
        security: 'healthy',
        lastChecked: new Date().toISOString()
      });
      setAlerts(alertsRes?.data || []);
      setPerformanceLogs(logsRes?.data || []);
      setSecurityEvents(securityRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load system data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadSystemData();
    showToast('System data refreshed', 'success');
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/system-alerts/${alertId}/resolve`, { method: 'PUT' });
      showToast('Alert resolved successfully', 'success');
      await loadSystemData();
    } catch (e: any) {
      showToast(e.message || 'Failed to resolve alert', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleExportLogs = async (type: 'performance' | 'security') => {
    try {
      showLoader(true);
      const res = await api('/api/admin/export-logs', {
        method: 'POST',
        body: { type, format: 'csv' }
      });
      
      // Create download link
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showToast(`${type} logs exported successfully`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to export logs', 'error');
    } finally {
      showLoader(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    loadSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          System-Wide Monitoring
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Overall Health"
            value={health.overall?.toUpperCase() || 'HEALTHY'}
            icon={<AssessmentIcon />}
            color={getStatusColor(health.overall || 'healthy') + '.main'}
            status={health.overall || 'healthy'}
            subtitle={`Last checked: ${new Date(health.lastChecked || new Date()).toLocaleTimeString()}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="System Uptime"
            value={formatUptime(metrics.uptime)}
            icon={<SpeedIcon />}
            color="primary.main"
            trend={2.1}
            subtitle="99.9% availability"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            icon={<NetworkIcon />}
            color="info.main"
            trend={5.3}
            subtitle="Currently online"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Response Time"
            value={`${metrics.responseTime}ms`}
            icon={<SpeedIcon />}
            color="success.main"
            trend={-1.2}
            subtitle="Average response"
          />
        </Grid>
      </Grid>

      {/* System Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CPU Usage
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.cpu || 0}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                color={metrics.cpu > 80 ? 'error' : metrics.cpu > 60 ? 'warning' : 'success'}
              />
              <Typography variant="h4" color={metrics.cpu > 80 ? 'error.main' : 'text.primary'}>
                {metrics.cpu}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Memory Usage
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.memory || 0}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                color={metrics.memory > 80 ? 'error' : metrics.memory > 60 ? 'warning' : 'success'}
              />
              <Typography variant="h4" color={metrics.memory > 80 ? 'error.main' : 'text.primary'}>
                {metrics.memory}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Disk Usage
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.disk || 0}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                color={metrics.disk > 80 ? 'error' : metrics.disk > 60 ? 'warning' : 'success'}
              />
              <Typography variant="h4" color={metrics.disk > 80 ? 'error.main' : 'text.primary'}>
                {metrics.disk}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Network I/O
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.network || 0}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                color={metrics.network > 80 ? 'error' : metrics.network > 60 ? 'warning' : 'success'}
              />
              <Typography variant="h4" color={metrics.network > 80 ? 'error.main' : 'text.primary'}>
                {metrics.network}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert 
          severity={alerts.some(a => a.severity === 'critical') ? 'error' : 'warning'} 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">
            {alerts.filter(a => !a.resolved).length} Active Alerts
          </Typography>
          <Typography variant="body2">
            {alerts.filter(a => a.severity === 'critical' && !a.resolved).length} Critical, {' '}
            {alerts.filter(a => a.severity === 'high' && !a.resolved).length} High Priority
          </Typography>
        </Alert>
      )}

      {/* Monitoring Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="System Health" />
            <Tab label="Alerts & Events" />
            <Tab label="Performance Logs" />
            <Tab label="Security Events" />
            <Tab label="System Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {/* System Health Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                System Health Status
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Component Status
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              label={health.database || 'healthy'}
                              color={getStatusColor(health.database || 'healthy')}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="Database"
                            secondary="MongoDB connection and performance"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              label={health.server || 'healthy'}
                              color={getStatusColor(health.server || 'healthy')}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="Server"
                            secondary="Node.js application server"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              label={health.network || 'healthy'}
                              color={getStatusColor(health.network || 'healthy')}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="Network"
                            secondary="API connectivity and latency"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              label={health.security || 'healthy'}
                              color={getStatusColor(health.security || 'healthy')}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="Security"
                            secondary="Authentication and authorization"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Requests
                        </Typography>
                        <Typography variant="h4" color="primary.main">
                          {metrics.totalRequests.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Error Rate
                        </Typography>
                        <Typography variant="h4" color={metrics.errorRate > 5 ? 'error.main' : 'success.main'}>
                          {metrics.errorRate}%
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Throughput
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          {metrics.throughput} req/s
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Alerts & Events Tab */}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  System Alerts & Events
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportLogs('performance')}
                >
                  Export Alerts
                </Button>
              </Box>
              
              {alerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>No Active Alerts</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All systems are operating normally.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {alert.type === 'error' && <ErrorIcon color="error" />}
                              {alert.type === 'warning' && <WarningIcon color="warning" />}
                              {alert.type === 'info' && <InfoIcon color="info" />}
                              {alert.type === 'success' && <CheckCircleIcon color="success" />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{alert.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {alert.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.severity}
                              color={getSeverityColor(alert.severity)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.resolved ? 'Resolved' : 'Active'}
                              color={alert.resolved ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {!alert.resolved && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Performance Logs Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Performance Logs
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportLogs('performance')}
                >
                  Export Logs
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Response Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {log.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.method}
                            color={log.method === 'GET' ? 'success' : log.method === 'POST' ? 'primary' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {log.responseTime}ms
                            </Typography>
                            {log.responseTime > 1000 && (
                              <WarningIcon color="warning" fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.statusCode}
                            color={log.statusCode >= 400 ? 'error' : log.statusCode >= 300 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {log.ip}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Security Events Tab */}
          {activeTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Security Events
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportLogs('security')}
                >
                  Export Events
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {event.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {event.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.severity}
                            color={getSeverityColor(event.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {event.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.resolved ? 'Resolved' : 'Active'}
                            color={event.resolved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* System Settings Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Monitoring Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Alert Thresholds
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          CPU Usage Alert
                        </Typography>
                        <Typography variant="h6">80%</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Memory Usage Alert
                        </Typography>
                        <Typography variant="h6">85%</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Disk Usage Alert
                        </Typography>
                        <Typography variant="h6">90%</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Response Time Alert
                        </Typography>
                        <Typography variant="h6">1000ms</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monitoring Configuration
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Real-time Monitoring"
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Performance Logging"
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Security Monitoring"
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={<Switch />}
                          label="Debug Mode"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemMonitoring;
