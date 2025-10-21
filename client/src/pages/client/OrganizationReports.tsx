import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface ReportData {
  employees: {
    total: number;
    active: number;
    onLeave: number;
    newHires: number;
  };
  attendance: {
    averageRate: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
  payroll: {
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    averageSalary: number;
  };
  leaves: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
  contractors: {
    total: number;
    active: number;
    totalHours: number;
    totalRevenue: number;
  };
}

const OrganizationReports: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [reportData, setReportData] = useState<ReportData>({
    employees: { total: 0, active: 0, onLeave: 0, newHires: 0 },
    attendance: { averageRate: 0, presentToday: 0, absentToday: 0, lateToday: 0 },
    payroll: { totalAmount: 0, pendingAmount: 0, paidAmount: 0, averageSalary: 0 },
    leaves: { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 },
    contractors: { total: 0, active: 0, totalHours: 0, totalRevenue: 0 }
  });
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const loadReportData = async () => {
    try {
      setLoading(true);
      showLoader(true);
      const response = await api('/api/client/reports', {
        method: 'POST',
        body: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setReportData(response?.data || reportData);
    } catch (e: any) {
      showToast(e.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      showLoader(true);
      await api('/api/client/reports/export', {
        method: 'POST',
        body: {
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      showToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to export report', 'error');
    } finally {
      showLoader(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ height: '100%' }}>
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Organization Reports
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReportData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
            disabled={loading}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
            disabled={loading}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                size="small"
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                onClick={loadReportData}
                disabled={loading}
                fullWidth
              >
                Generate Report
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Report Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={reportData.employees.total}
            icon={<PeopleIcon />}
            color="primary.main"
            trend={5.2}
            subtitle={`${reportData.employees.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${reportData.attendance.averageRate}%`}
            icon={<ScheduleIcon />}
            color="success.main"
            trend={2.1}
            subtitle={`${reportData.attendance.presentToday} present today`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Payroll"
            value={formatCurrency(reportData.payroll.totalAmount)}
            icon={<MoneyIcon />}
            color="warning.main"
            trend={8.3}
            subtitle={`${formatCurrency(reportData.payroll.averageSalary)} avg salary`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leave Requests"
            value={reportData.leaves.totalRequests}
            icon={<EventIcon />}
            color="info.main"
            trend={1.5}
            subtitle={`${reportData.leaves.pendingRequests} pending`}
          />
        </Grid>
      </Grid>

      {/* Detailed Reports */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Employee Overview" />
            <Tab label="Attendance Analysis" />
            <Tab label="Payroll Summary" />
            <Tab label="Leave Analysis" />
            <Tab label="Contractor Report" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Employee Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employee Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PeopleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Employees"
                            secondary={reportData.employees.total}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WorkIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Active Employees"
                            secondary={reportData.employees.active}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="On Leave"
                            secondary={reportData.employees.onLeave}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PeopleIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="New Hires"
                            secondary={reportData.employees.newHires}
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
                        Department Distribution
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Department breakdown chart would be displayed here
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Attendance Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Today's Attendance
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Present Today"
                            secondary={reportData.attendance.presentToday}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Absent Today"
                            secondary={reportData.attendance.absentToday}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Late Today"
                            secondary={reportData.attendance.lateToday}
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
                        Attendance Trends
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Attendance trend chart would be displayed here
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payroll Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payroll Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Payroll Amount"
                            secondary={formatCurrency(reportData.payroll.totalAmount)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Pending Amount"
                            secondary={formatCurrency(reportData.payroll.pendingAmount)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Paid Amount"
                            secondary={formatCurrency(reportData.payroll.paidAmount)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Average Salary"
                            secondary={formatCurrency(reportData.payroll.averageSalary)}
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
                        Payroll Trends
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Payroll trend chart would be displayed here
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Leave Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Leave Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Requests"
                            secondary={reportData.leaves.totalRequests}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Pending Requests"
                            secondary={reportData.leaves.pendingRequests}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Approved Requests"
                            secondary={reportData.leaves.approvedRequests}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Rejected Requests"
                            secondary={reportData.leaves.rejectedRequests}
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
                        Leave Trends
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Leave trend chart would be displayed here
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contractor Report
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contractor Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <WorkIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Contractors"
                            secondary={reportData.contractors.total}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WorkIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Active Contractors"
                            secondary={reportData.contractors.active}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Hours"
                            secondary={`${reportData.contractors.totalHours} hours`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Revenue"
                            secondary={formatCurrency(reportData.contractors.totalRevenue)}
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
                        Contractor Performance
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Contractor performance chart would be displayed here
                        </Typography>
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

export default OrganizationReports;
