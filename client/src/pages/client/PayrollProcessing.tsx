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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface PayrollRecord {
  _id: string;
  employeeName: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  overtimeHours: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  generatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
}

const PayrollProcessing: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    includeContractors: false
  });

  const filtered = useMemo(() => {
    let filteredRecords = payrollRecords;
    
    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.employeeName.toLowerCase().includes(q) || 
        record.employeeId.toLowerCase().includes(q)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filteredRecords = filteredRecords.filter(record => record.status === statusFilter);
    }
    
    // Month filter
    if (monthFilter) {
      filteredRecords = filteredRecords.filter(record => record.month === parseInt(monthFilter));
    }
    
    // Year filter
    if (yearFilter) {
      filteredRecords = filteredRecords.filter(record => record.year === parseInt(yearFilter));
    }
    
    return filteredRecords;
  }, [payrollRecords, query, statusFilter, monthFilter, yearFilter]);

  const loadPayrollData = async () => {
    try {
      showLoader(true);
      const [payrollRes, employeesRes] = await Promise.all([
        api('/api/client/payroll'),
        api('/api/client/employees')
      ]);
      
      setPayrollRecords(payrollRes?.data || []);
      setEmployees(employeesRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load payroll data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      setProcessing(true);
      showLoader(true);
      await api('/api/client/payroll/generate', { 
        method: 'POST', 
        body: generateForm 
      });
      showToast('Payroll generated successfully', 'success');
      await loadPayrollData();
      setOpen(false);
    } catch (e: any) {
      showToast(e.message || 'Failed to generate payroll', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      setProcessing(true);
      showLoader(true);
      await api(`/api/client/payroll/${recordId}/approve`, { method: 'PUT' });
      showToast('Payroll approved successfully', 'success');
      await loadPayrollData();
    } catch (e: any) {
      showToast(e.message || 'Failed to approve payroll', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const handleReject = async (recordId: string) => {
    try {
      setProcessing(true);
      showLoader(true);
      await api(`/api/client/payroll/${recordId}/reject`, { method: 'PUT' });
      showToast('Payroll rejected successfully', 'success');
      await loadPayrollData();
    } catch (e: any) {
      showToast(e.message || 'Failed to reject payroll', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const handleMarkPaid = async (recordId: string) => {
    try {
      setProcessing(true);
      showLoader(true);
      await api(`/api/client/payroll/${recordId}/mark-paid`, { method: 'PUT' });
      showToast('Payroll marked as paid successfully', 'success');
      await loadPayrollData();
    } catch (e: any) {
      showToast(e.message || 'Failed to mark payroll as paid', 'error');
    } finally {
      setProcessing(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  useEffect(() => {
    loadPayrollData();
  }, []);

  const pendingCount = filtered.filter(record => record.status === 'pending').length;
  const approvedCount = filtered.filter(record => record.status === 'approved').length;
  const paidCount = filtered.filter(record => record.status === 'paid').length;
  const totalAmount = filtered.reduce((sum, record) => sum + record.netSalary, 0);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Payroll Processing
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPayrollData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => setOpen(true)}
          >
            Generate Payroll
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Records
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {filtered.length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
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
                    Pending Approval
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {pendingCount}
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main', fontSize: 40 }}>
                  <ScheduleIcon />
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
                    Paid This Month
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {paidCount}
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', fontSize: 40 }}>
                  <CheckCircleIcon />
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
                    Total Amount
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                  <MoneyIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Approvals Alert */}
      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">
            {pendingCount} payroll records pending approval
          </Typography>
          <Typography variant="body2">
            Review and approve payroll records to process payments.
          </Typography>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                size="small"
                placeholder="Search employees..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  label="Month"
                >
                  <MenuItem value="">All Months</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  label="Year"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setQuery('');
                  setStatusFilter('');
                  setMonthFilter('');
                  setYearFilter('');
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payroll Records */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Records" />
            <Tab label="Pending Approval" />
            <Tab label="Approved" />
            <Tab label="Paid" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Payroll Records
              </Typography>
              
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No payroll records found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the filters above or generate new payroll records.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell>Allowances</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {record.employeeName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{record.employeeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {record.employeeId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getMonthName(record.month)} {record.year}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.presentDays}/{record.workingDays} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(record.basicSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
                              +{formatCurrency(record.allowances.reduce((sum, a) => sum + a.amount, 0))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main">
                              -{formatCurrency(record.totalDeductions)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {formatCurrency(record.netSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.toUpperCase()}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setOpen(true);
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {record.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleApprove(record._id)}
                                    disabled={processing}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleReject(record._id)}
                                    disabled={processing}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {record.status === 'approved' && (
                              <Tooltip title="Mark as Paid">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleMarkPaid(record._id)}
                                  disabled={processing}
                                >
                                  <MoneyIcon />
                                </IconButton>
                              </Tooltip>
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

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Pending Approval ({pendingCount})
              </Typography>
              {filtered.filter(record => record.status === 'pending').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>No pending approvals</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All payroll records have been approved.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Generated At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => record.status === 'pending').map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {record.employeeName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{record.employeeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {record.employeeId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getMonthName(record.month)} {record.year}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {formatCurrency(record.netSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.generatedAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApprove(record._id)}
                                disabled={processing}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(record._id)}
                                disabled={processing}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Approved Records ({approvedCount})
              </Typography>
              {filtered.filter(record => record.status === 'approved').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No approved records</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved payroll records will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Approved At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => record.status === 'approved').map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {record.employeeName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{record.employeeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {record.employeeId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getMonthName(record.month)} {record.year}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {formatCurrency(record.netSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedAt ? formatDate(record.approvedAt) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Mark as Paid">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleMarkPaid(record._id)}
                                disabled={processing}
                              >
                                <MoneyIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Paid Records ({paidCount})
              </Typography>
              {filtered.filter(record => record.status === 'paid').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No paid records</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid payroll records will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Paid At</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => record.status === 'paid').map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {record.employeeName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{record.employeeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {record.employeeId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getMonthName(record.month)} {record.year}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {formatCurrency(record.netSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.paidAt ? formatDate(record.paidAt) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.toUpperCase()}
                              color={getStatusColor(record.status)}
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

      {/* Generate Payroll Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm({ ...generateForm, month: Number(e.target.value) })}
                  label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                  label="Year"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Include Contractors</InputLabel>
                <Select
                  value={generateForm.includeContractors}
                  onChange={(e) => setGenerateForm({ ...generateForm, includeContractors: e.target.value === 'true' })}
                  label="Include Contractors"
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGeneratePayroll}
            disabled={processing}
          >
            {processing ? 'Generating...' : 'Generate Payroll'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payroll Details Dialog */}
      <Dialog open={selectedRecord !== null} onClose={() => setSelectedRecord(null)} fullWidth maxWidth="md">
        <DialogTitle>Payroll Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                <Typography variant="body1">{selectedRecord.employeeName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                <Typography variant="body1">{selectedRecord.employeeId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Period</Typography>
                <Typography variant="body1">{getMonthName(selectedRecord.month)} {selectedRecord.year}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip
                  icon={getStatusIcon(selectedRecord.status)}
                  label={selectedRecord.status.toUpperCase()}
                  color={getStatusColor(selectedRecord.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Basic Salary</Typography>
                <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedRecord.basicSalary)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Net Salary</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(selectedRecord.netSalary)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Allowances</Typography>
                <List dense>
                  {selectedRecord.allowances.map((allowance, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={allowance.name}
                        secondary={formatCurrency(allowance.amount)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Deductions</Typography>
                <List dense>
                  {selectedRecord.deductions.map((deduction, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={deduction.name}
                        secondary={formatCurrency(deduction.amount)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRecord(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollProcessing;
