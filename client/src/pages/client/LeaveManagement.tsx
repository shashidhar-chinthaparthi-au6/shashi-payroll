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
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface LeaveRecord {
  _id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  attachments?: string[];
}

const LeaveManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filtered = useMemo(() => {
    let filteredRecords = leaveRecords;
    
    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.employeeName.toLowerCase().includes(q) || 
        record.employeeId.toLowerCase().includes(q) ||
        record.reason.toLowerCase().includes(q)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filteredRecords = filteredRecords.filter(record => record.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter) {
      filteredRecords = filteredRecords.filter(record => record.leaveType === typeFilter);
    }
    
    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.startDate).toDateString() === filterDate ||
        new Date(record.endDate).toDateString() === filterDate
      );
    }
    
    return filteredRecords;
  }, [leaveRecords, query, statusFilter, typeFilter, dateFilter]);

  const loadLeaveData = async () => {
    try {
      showLoader(true);
      const [leaveRes, employeesRes] = await Promise.all([
        api('/api/client/leaves'),
        api('/api/client/employees')
      ]);
      
      setLeaveRecords(leaveRes?.data || []);
      setEmployees(employeesRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load leave data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      setProcessing(true);
      showLoader(true);
      await api(`/api/client/leaves/${recordId}/approve`, { method: 'PUT' });
      showToast('Leave approved successfully', 'success');
      await loadLeaveData();
    } catch (e: any) {
      showToast(e.message || 'Failed to approve leave', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const handleReject = async (recordId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }

    try {
      setProcessing(true);
      showLoader(true);
      await api(`/api/client/leaves/${recordId}/reject`, { 
        method: 'PUT',
        body: { rejectionReason }
      });
      showToast('Leave rejected successfully', 'success');
      setRejectionReason('');
      await loadLeaveData();
    } catch (e: any) {
      showToast(e.message || 'Failed to reject leave', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const handleBulkApprove = async () => {
    try {
      setProcessing(true);
      showLoader(true);
      const pendingRecords = filtered.filter(record => record.status === 'pending');
      await Promise.all(
        pendingRecords.map(record => 
          api(`/api/client/leaves/${record._id}/approve`, { method: 'PUT' })
        )
      );
      showToast(`${pendingRecords.length} leave requests approved`, 'success');
      await loadLeaveData();
    } catch (e: any) {
      showToast(e.message || 'Failed to bulk approve leaves', 'error');
    } finally {
      setProcessing(false);
      showLoader(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return 'error';
      case 'vacation': return 'success';
      case 'personal': return 'info';
      case 'maternity': return 'secondary';
      case 'paternity': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  const pendingCount = filtered.filter(record => record.status === 'pending').length;
  const approvedCount = filtered.filter(record => record.status === 'approved').length;
  const rejectedCount = filtered.filter(record => record.status === 'rejected').length;
  const totalDays = filtered.reduce((sum, record) => sum + record.days, 0);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Leave Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadLeaveData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => showToast('Export feature coming soon', 'info')}
          >
            Export
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
                    Total Requests
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {filtered.length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                  <EventIcon />
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
                    Approved
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {approvedCount}
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
                    Total Days
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {totalDays}
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', fontSize: 40 }}>
                  <EventIcon />
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
            {pendingCount} leave requests pending approval
          </Typography>
          <Typography variant="body2">
            Review and approve leave requests to ensure proper workforce planning.
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
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Leave Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="vacation">Vacation</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="maternity">Maternity</MenuItem>
                  <MenuItem value="paternity">Paternity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                size="small"
                type="date"
                label="Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setQuery('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setDateFilter('');
                }}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Records */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Requests" />
            <Tab label="Pending Approval" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  All Leave Requests
                </Typography>
                {pendingCount > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleBulkApprove}
                    disabled={processing}
                  >
                    Approve All Pending ({pendingCount})
                  </Button>
                )}
              </Box>
              
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No leave requests found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the filters above or check back later for new requests.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied At</TableCell>
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
                            <Chip
                              label={record.leaveType.toUpperCase()}
                              color={getLeaveTypeColor(record.leaveType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {record.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {record.reason}
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
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(record.appliedAt)}
                            </Typography>
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
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setRejectionReason('');
                                      setOpen(true);
                                    }}
                                    disabled={processing}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
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
                    All leave requests have been processed.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Applied At</TableCell>
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
                            <Chip
                              label={record.leaveType.toUpperCase()}
                              color={getLeaveTypeColor(record.leaveType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {record.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {record.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(record.appliedAt)}
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
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setRejectionReason('');
                                  setOpen(true);
                                }}
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
                Approved Requests ({approvedCount})
              </Typography>
              {filtered.filter(record => record.status === 'approved').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No approved requests</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved leave requests will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Approved At</TableCell>
                        <TableCell>Approved By</TableCell>
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
                            <Chip
                              label={record.leaveType.toUpperCase()}
                              color={getLeaveTypeColor(record.leaveType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {record.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedAt ? formatDateTime(record.approvedAt) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedBy || '-'}
                            </Typography>
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
                Rejected Requests ({rejectedCount})
              </Typography>
              {filtered.filter(record => record.status === 'rejected').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No rejected requests</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected leave requests will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Rejection Reason</TableCell>
                        <TableCell>Rejected At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => record.status === 'rejected').map((record) => (
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
                            <Chip
                              label={record.leaveType.toUpperCase()}
                              color={getLeaveTypeColor(record.leaveType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {record.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {record.rejectionReason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedAt ? formatDateTime(record.approvedAt) : '-'}
                            </Typography>
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

      {/* Leave Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Leave Request Details</DialogTitle>
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
                <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                <Chip
                  label={selectedRecord.leaveType.toUpperCase()}
                  color={getLeaveTypeColor(selectedRecord.leaveType)}
                  size="small"
                />
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
                <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                <Typography variant="body1">{formatDate(selectedRecord.startDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                <Typography variant="body1">{formatDate(selectedRecord.endDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Total Days</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedRecord.days} days</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Applied At</Typography>
                <Typography variant="body1">{formatDateTime(selectedRecord.appliedAt)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                <Typography variant="body1">{selectedRecord.reason}</Typography>
              </Grid>
              {selectedRecord.rejectionReason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Rejection Reason</Typography>
                  <Typography variant="body1" color="error.main">{selectedRecord.rejectionReason}</Typography>
                </Grid>
              )}
              {selectedRecord.status === 'pending' && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Rejection Reason (if rejecting)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          {selectedRecord?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApprove(selectedRecord._id)}
                disabled={processing}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleReject(selectedRecord._id)}
                disabled={processing || !rejectionReason.trim()}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
