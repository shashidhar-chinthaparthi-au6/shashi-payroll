import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import { useAppSettings } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalEmployees: number;
  totalOrganizations: number;
  averageAttendance: number;
  payrollProcessed: number;
  contractsActive: number;
  growthRate: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

interface OrganizationReport {
  organizationId: string;
  organizationName: string;
  revenue: number;
  employees: number;
  attendance: number;
  payroll: number;
  contracts: number;
  growth: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  employees: number;
  attendance: number;
  payroll: number;
}

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

const SimpleChart: React.FC<{
  title: string;
  data: number[];
  labels: string[];
  color: string;
}> = ({ title, data, labels, color }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1, p: 2 }}>
        {data.map((value, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: `${(value / Math.max(...data)) * 100}%`,
              backgroundColor: color,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'center',
              minHeight: 20,
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {labels.map((label, index) => (
          <Typography key={index} variant="caption" color="textSecondary">
            {label}
          </Typography>
        ))}
      </Box>
    </CardContent>
  </Card>
);

const AdvancedReporting: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const { currency } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  
  // Data states
  const [reportData, setReportData] = useState<ReportData>({
    period: '',
    totalRevenue: 0,
    totalEmployees: 0,
    totalOrganizations: 0,
    averageAttendance: 0,
    payrollProcessed: 0,
    contractsActive: 0,
    growthRate: 0,
  });
  
  const [organizations, setOrganizations] = useState<OrganizationReport[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [attendanceChartData, setAttendanceChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [payrollChartData, setPayrollChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });

  const formatCurrency = (amount: number) => {
    const c = currency === 'INR' ? 'INR' : 'USD';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: c,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${c} ${amount}`;
    }
  };

  const loadReportData = async () => {
    try {
      showLoader(true);
      const res = await api('/api/admin/advanced-reports', {
        method: 'POST',
        body: { period: reportPeriod, organization: selectedOrganization }
      });
      const data = res?.data || {};
      
      setReportData(data.summary || reportData);
      setOrganizations(data.organizations || []);
      setTimeSeriesData(data.timeSeries || []);
      setRevenueChartData(data.revenueChart || revenueChartData);
      setAttendanceChartData(data.attendanceChart || attendanceChartData);
      setPayrollChartData(data.payrollChart || payrollChartData);
    } catch (e: any) {
      showToast(e.message || 'Failed to load advanced reports', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      showLoader(true);
      const res = await api('/api/admin/export-report', {
        method: 'POST',
        body: { 
          format, 
          period: reportPeriod, 
          organization: selectedOrganization,
          reportType: activeTab 
        }
      });
      
      // Create download link
      const blob = new Blob([res.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `advanced-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to export report', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [reportPeriod, selectedOrganization]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress variant="indeterminate" />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading advanced reports...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Advanced Reporting
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Organization</InputLabel>
            <Select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              label="Organization"
            >
              <MenuItem value="all">All Organizations</MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.organizationId} value={org.organizationId}>
                  {org.organizationName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReportData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Export Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Export Reports</Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('pdf')}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('excel')}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('csv')}
              >
                CSV
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(reportData.totalRevenue)}
            icon={<MoneyIcon />}
            color="success.main"
            trend={reportData.growthRate}
            subtitle={`${reportPeriod} revenue`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={reportData.totalEmployees}
            icon={<PeopleIcon />}
            color="primary.main"
            trend={5.2}
            subtitle="Active employees"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Attendance"
            value={`${reportData.averageAttendance}%`}
            icon={<ScheduleIcon />}
            color="info.main"
            trend={2.1}
            subtitle="System-wide"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Contracts"
            value={reportData.contractsActive}
            icon={<AssessmentIcon />}
            color="warning.main"
            trend={8.3}
            subtitle="Current contracts"
          />
        </Grid>
      </Grid>

      {/* Detailed Reports Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Revenue Analysis" />
            <Tab label="Attendance Reports" />
            <Tab label="Payroll Analysis" />
            <Tab label="Organization Comparison" />
            <Tab label="Time Series" />
            <Tab label="Performance Metrics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Revenue Analysis */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Revenue Analysis - {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SimpleChart
                    title="Revenue by Organization"
                    data={organizations.map(org => org.revenue)}
                    labels={organizations.map(org => org.organizationName)}
                    color="#4caf50"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Distribution
                      </Typography>
                      {organizations.map((org, index) => (
                        <Box key={org.organizationId} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2">{org.organizationName}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(org.revenue)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(0, Math.min(100, (org.revenue / Math.max(...organizations.map(o => o.revenue))) * 100))}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Attendance Reports */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Attendance Reports - {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SimpleChart
                    title="Attendance by Organization"
                    data={organizations.map(org => org.attendance)}
                    labels={organizations.map(org => org.organizationName)}
                    color="#2196f3"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Attendance Summary
                      </Typography>
                      {organizations.map((org) => (
                        <Box key={org.organizationId} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {org.organizationName}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2">Employees: {org.employees}</Typography>
                            <Typography variant="body2">Attendance: {org.attendance}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={org.attendance || 0}
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Payroll Analysis */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payroll Analysis - {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SimpleChart
                    title="Payroll by Organization"
                    data={organizations.map(org => org.payroll)}
                    labels={organizations.map(org => org.organizationName)}
                    color="#ff9800"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payroll Summary
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Payroll Processed
                        </Typography>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {formatCurrency(reportData.payrollProcessed)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      {organizations.map((org) => (
                        <Box key={org.organizationId} sx={{ mb: 1 }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">{org.organizationName}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(org.payroll)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Organization Comparison */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Organization Comparison
              </Typography>
              <Grid container spacing={3}>
                {organizations.map((org) => (
                  <Grid item xs={12} md={6} lg={4} key={org.organizationId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {org.organizationName}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Revenue
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(org.revenue)}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Employees
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {org.employees}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Attendance Rate
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={org.attendance || 0}
                              sx={{ flexGrow: 1, mr: 1, height: 6 }}
                            />
                            <Typography variant="body2">{org.attendance}%</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Growth Rate
                          </Typography>
                          <Box display="flex" alignItems="center">
                            {org.growth > 0 ? (
                              <TrendingUpIcon color="success" fontSize="small" />
                            ) : (
                              <TrendingDownIcon color="error" fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color={org.growth > 0 ? 'success.main' : 'error.main'}
                            >
                              {Math.abs(org.growth)}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Time Series */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Time Series Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SimpleChart
                    title="Revenue Over Time"
                    data={timeSeriesData.map(d => d.revenue)}
                    labels={timeSeriesData.map(d => new Date(d.date).toLocaleDateString())}
                    color="#4caf50"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SimpleChart
                    title="Attendance Over Time"
                    data={timeSeriesData.map(d => d.attendance)}
                    labels={timeSeriesData.map(d => new Date(d.date).toLocaleDateString())}
                    color="#2196f3"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Performance Metrics */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        System Performance
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          System Uptime
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          99.9%
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Response Time
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          120ms
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        User Activity
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Active Users
                        </Typography>
                        <Typography variant="h4" color="primary.main">
                          {reportData.totalEmployees}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Daily Logins
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {Math.round(reportData.totalEmployees * 0.8)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Business Metrics
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Revenue Growth
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {reportData.growthRate}%
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Contract Success
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          95%
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

export default AdvancedReporting;
