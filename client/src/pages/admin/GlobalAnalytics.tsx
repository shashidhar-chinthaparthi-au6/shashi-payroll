import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Alert,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import { useAppSettings } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface GlobalStats {
  totalOrganizations: number;
  totalUsers: number;
  totalEmployees: number;
  totalContractors: number;
  activeContracts: number;
  totalRevenue: number;
  unpaidInvoices: number;
  systemUptime: number;
}

interface OrganizationData {
  _id: string;
  name: string;
  type: string;
  totalEmployees: number;
  totalContractors: number;
  monthlyRevenue: number;
  attendanceRate: number;
  status: string;
}

interface ContractorUtilization {
  contractorId: string;
  contractorName: string;
  totalAssignments: number;
  totalHours: number;
  totalRevenue: number;
  utilizationRate: number;
  activeContracts: number;
}

interface RevenueData {
  organizationId: string;
  organizationName: string;
  monthlyRevenue: number;
  totalEmployees: number;
  revenuePerEmployee: number;
  growthRate: number;
}

interface AttendanceData {
  organizationId: string;
  organizationName: string;
  totalEmployees: number;
  presentToday: number;
  attendanceRate: number;
  averageHours: number;
}

interface PayrollData {
  organizationId: string;
  organizationName: string;
  totalPayroll: number;
  averageSalary: number;
  totalEmployees: number;
  processedThisMonth: boolean;
}

interface UnpaidInvoice {
  _id: string;
  contractorName: string;
  organizationName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
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

const GlobalAnalytics: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const { currency } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Data states
  const [stats, setStats] = useState<GlobalStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalEmployees: 0,
    totalContractors: 0,
    activeContracts: 0,
    totalRevenue: 0,
    unpaidInvoices: 0,
    systemUptime: 0,
  });
  
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [contractorUtilization, setContractorUtilization] = useState<ContractorUtilization[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);

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

  const loadAnalytics = async () => {
    try {
      showLoader(true);
      const res = await api('/api/admin/global-analytics');
      const data = res?.data || {};
      
      setStats(data.stats || stats);
      setOrganizations(data.organizations || []);
      setContractorUtilization(data.contractorUtilization || []);
      setRevenueData(data.revenueData || []);
      setAttendanceData(data.attendanceData || []);
      setPayrollData(data.payrollData || []);
      setUnpaidInvoices(data.unpaidInvoices || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load global analytics', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress variant="indeterminate" />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading global analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Global Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Organizations"
            value={stats.totalOrganizations}
            icon={<BusinessIcon />}
            color="primary.main"
            trend={5.2}
            subtitle="Active organizations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="success.main"
            trend={12.5}
            subtitle="All system users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<MoneyIcon />}
            color="warning.main"
            trend={8.3}
            subtitle="Monthly revenue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Uptime"
            value={`${stats.systemUptime}%`}
            icon={<ScheduleIcon />}
            color="info.main"
            trend={2.1}
            subtitle="Last 30 days"
          />
        </Grid>
      </Grid>

      {/* Alerts */}
      {stats.unpaidInvoices > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">
            {stats.unpaidInvoices} unpaid invoices require attention
          </Typography>
        </Alert>
      )}

      {/* Detailed Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Organizations Overview" />
            <Tab label="Contractor Utilization" />
            <Tab label="Revenue Analysis" />
            <Tab label="Attendance Reports" />
            <Tab label="Payroll Reports" />
            <Tab label="Unpaid Invoices" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Organizations Overview */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Organizations Data
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Employees</TableCell>
                      <TableCell>Contractors</TableCell>
                      <TableCell>Monthly Revenue</TableCell>
                      <TableCell>Attendance Rate</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org._id}>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.type}</TableCell>
                        <TableCell>{org.totalEmployees}</TableCell>
                        <TableCell>{org.totalContractors}</TableCell>
                        <TableCell>{formatCurrency(org.monthlyRevenue)}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={org.attendanceRate || 0}
                              sx={{ width: 60, mr: 1 }}
                            />
                            {org.attendanceRate}%
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={org.status}
                            color={org.status === 'active' ? 'success' : 'default'}
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

          {/* Contractor Utilization */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contractor Utilization
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contractor</TableCell>
                      <TableCell>Total Assignments</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell>Total Revenue</TableCell>
                      <TableCell>Utilization Rate</TableCell>
                      <TableCell>Active Contracts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contractorUtilization.map((contractor) => (
                      <TableRow key={contractor.contractorId}>
                        <TableCell>{contractor.contractorName}</TableCell>
                        <TableCell>{contractor.totalAssignments}</TableCell>
                        <TableCell>{contractor.totalHours}</TableCell>
                        <TableCell>{formatCurrency(contractor.totalRevenue)}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={contractor.utilizationRate || 0}
                              sx={{ width: 60, mr: 1 }}
                            />
                            {contractor.utilizationRate}%
                          </Box>
                        </TableCell>
                        <TableCell>{contractor.activeContracts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Revenue Analysis */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Revenue per Organization
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Monthly Revenue</TableCell>
                      <TableCell>Total Employees</TableCell>
                      <TableCell>Revenue per Employee</TableCell>
                      <TableCell>Growth Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData.map((revenue) => (
                      <TableRow key={revenue.organizationId}>
                        <TableCell>{revenue.organizationName}</TableCell>
                        <TableCell>{formatCurrency(revenue.monthlyRevenue)}</TableCell>
                        <TableCell>{revenue.totalEmployees}</TableCell>
                        <TableCell>{formatCurrency(revenue.revenuePerEmployee)}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {revenue.growthRate > 0 ? (
                              <TrendingUpIcon color="success" fontSize="small" />
                            ) : (
                              <TrendingDownIcon color="error" fontSize="small" />
                            )}
                            <Typography
                              color={revenue.growthRate > 0 ? 'success.main' : 'error.main'}
                            >
                              {Math.abs(revenue.growthRate)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Attendance Reports */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Global Attendance Reports
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Total Employees</TableCell>
                      <TableCell>Present Today</TableCell>
                      <TableCell>Attendance Rate</TableCell>
                      <TableCell>Average Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((attendance) => (
                      <TableRow key={attendance.organizationId}>
                        <TableCell>{attendance.organizationName}</TableCell>
                        <TableCell>{attendance.totalEmployees}</TableCell>
                        <TableCell>{attendance.presentToday}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={attendance.attendanceRate || 0}
                              sx={{ width: 60, mr: 1 }}
                            />
                            {attendance.attendanceRate}%
                          </Box>
                        </TableCell>
                        <TableCell>{attendance.averageHours}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Payroll Reports */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Global Payroll Reports
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Total Payroll</TableCell>
                      <TableCell>Average Salary</TableCell>
                      <TableCell>Total Employees</TableCell>
                      <TableCell>Processed This Month</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payrollData.map((payroll) => (
                      <TableRow key={payroll.organizationId}>
                        <TableCell>{payroll.organizationName}</TableCell>
                        <TableCell>{formatCurrency(payroll.totalPayroll)}</TableCell>
                        <TableCell>{formatCurrency(payroll.averageSalary)}</TableCell>
                        <TableCell>{payroll.totalEmployees}</TableCell>
                        <TableCell>
                          <Chip
                            label={payroll.processedThisMonth ? 'Yes' : 'No'}
                            color={payroll.processedThisMonth ? 'success' : 'error'}
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

          {/* Unpaid Invoices */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Unpaid Invoices
              </Typography>
              {unpaidInvoices.length === 0 ? (
                <Alert severity="success">
                  <Typography>No unpaid invoices found!</Typography>
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contractor</TableCell>
                        <TableCell>Organization</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Days Overdue</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidInvoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell>{invoice.contractorName}</TableCell>
                          <TableCell>{invoice.organizationName}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${invoice.daysOverdue} days`}
                              color={invoice.daysOverdue > 30 ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={invoice.status === 'overdue' ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GlobalAnalytics;