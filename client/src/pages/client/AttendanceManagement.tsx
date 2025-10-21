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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface AttendanceRecord {
  _id: string;
  employeeName: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  workingHours: number;
  overtimeHours: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

const AttendanceManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [approving, setApproving] = useState(false);

  const filtered = useMemo(() => {
    let filteredRecords = attendanceRecords;
    
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
    
    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.date).toDateString() === filterDate
      );
    }
    
    return filteredRecords;
  }, [attendanceRecords, query, statusFilter, dateFilter]);

  const loadAttendanceData = async () => {
    try {
      showLoader(true);
      const [attendanceRes, employeesRes] = await Promise.all([
        api('/api/client/attendance'),
        api('/api/client/employees')
      ]);
      
      setAttendanceRecords(attendanceRes?.data || []);
      setEmployees(employeesRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load attendance data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      setApproving(true);
      showLoader(true);
      await api(`/api/client/attendance/${recordId}/approve`, { method: 'PUT' });
      showToast('Attendance approved successfully', 'success');
      await loadAttendanceData();
    } catch (e: any) {
      showToast(e.message || 'Failed to approve attendance', 'error');
    } finally {
      setApproving(false);
      showLoader(false);
    }
  };

  const handleReject = async (recordId: string) => {
    try {
      setApproving(true);
      showLoader(true);
      await api(`/api/client/attendance/${recordId}/reject`, { method: 'PUT' });
      showToast('Attendance rejected successfully', 'success');
      await loadAttendanceData();
    } catch (e: any) {
      showToast(e.message || 'Failed to reject attendance', 'error');
    } finally {
      setApproving(false);
      showLoader(false);
    }
  };

  const handleBulkApprove = async () => {
    try {
      setApproving(true);
      showLoader(true);
      const pendingRecords = filtered.filter(record => !record.approvedBy);
      await Promise.all(
        pendingRecords.map(record => 
          api(`/api/client/attendance/${record._id}/approve`, { method: 'PUT' })
        )
      );
      showToast(`${pendingRecords.length} attendance records approved`, 'success');
      await loadAttendanceData();
    } catch (e: any) {
      showToast(e.message || 'Failed to bulk approve attendance', 'error');
    } finally {
      setApproving(false);
      showLoader(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half_day': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <CancelIcon />;
      case 'late': return <ScheduleIcon />;
      case 'half_day': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const pendingCount = filtered.filter(record => !record.approvedBy).length;
  const approvedCount = filtered.filter(record => record.approvedBy).length;
  const presentCount = filtered.filter(record => record.status === 'present').length;
  const absentCount = filtered.filter(record => record.status === 'absent').length;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Attendance Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAttendanceData}
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
                    Total Records
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {filtered.length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
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
                    Present Today
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {presentCount}
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
                    Absent Today
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {absentCount}
                  </Typography>
                </Box>
                <Box sx={{ color: 'error.main', fontSize: 40 }}>
                  <CancelIcon />
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
            {pendingCount} attendance records pending approval
          </Typography>
          <Typography variant="body2">
            Review and approve attendance records to ensure accurate payroll processing.
          </Typography>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                size="small"
                placeholder="Search employees..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="half_day">Half Day</MenuItem>
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

      {/* Attendance Records */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Records" />
            <Tab label="Pending Approval" />
            <Tab label="Approved" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  All Attendance Records
                </Typography>
                {pendingCount > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleBulkApprove}
                    disabled={approving}
                  >
                    Approve All Pending ({pendingCount})
                  </Button>
                )}
              </Box>
              
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No attendance records found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the filters above or check back later for new records.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Approval</TableCell>
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
                              {formatDate(record.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(record.checkIn)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.checkOut ? formatTime(record.checkOut) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.replace('_', ' ').toUpperCase()}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.workingHours}h
                              {record.overtimeHours > 0 && (
                                <Typography variant="caption" color="warning.main" display="block">
                                  +{record.overtimeHours}h OT
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {record.approvedBy ? (
                              <Chip
                                label="Approved"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                label="Pending"
                                color="warning"
                                size="small"
                              />
                            )}
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
                            {!record.approvedBy && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleApprove(record._id)}
                                    disabled={approving}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleReject(record._id)}
                                    disabled={approving}
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
              {filtered.filter(record => !record.approvedBy).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>No pending approvals</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All attendance records have been approved.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => !record.approvedBy).map((record) => (
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
                              {formatDate(record.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(record.checkIn)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.checkOut ? formatTime(record.checkOut) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.replace('_', ' ').toUpperCase()}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.workingHours}h
                              {record.overtimeHours > 0 && (
                                <Typography variant="caption" color="warning.main" display="block">
                                  +{record.overtimeHours}h OT
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApprove(record._id)}
                                disabled={approving}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(record._id)}
                                disabled={approving}
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
              {filtered.filter(record => record.approvedBy).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>No approved records</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved attendance records will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Approved By</TableCell>
                        <TableCell>Approved At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.filter(record => record.approvedBy).map((record) => (
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
                              {formatDate(record.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(record.checkIn)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.checkOut ? formatTime(record.checkOut) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.replace('_', ' ').toUpperCase()}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.workingHours}h
                              {record.overtimeHours > 0 && (
                                <Typography variant="caption" color="warning.main" display="block">
                                  +{record.overtimeHours}h OT
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedBy || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.approvedAt ? formatDate(record.approvedAt) : '-'}
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

      {/* Attendance Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Attendance Details</DialogTitle>
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
                <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                <Typography variant="body1">{formatDate(selectedRecord.date)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip
                  icon={getStatusIcon(selectedRecord.status)}
                  label={selectedRecord.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(selectedRecord.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Check In</Typography>
                <Typography variant="body1">{formatTime(selectedRecord.checkIn)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Check Out</Typography>
                <Typography variant="body1">
                  {selectedRecord.checkOut ? formatTime(selectedRecord.checkOut) : 'Not checked out'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Working Hours</Typography>
                <Typography variant="body1">{selectedRecord.workingHours} hours</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Overtime Hours</Typography>
                <Typography variant="body1">{selectedRecord.overtimeHours} hours</Typography>
              </Grid>
              {selectedRecord.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                  <Typography variant="body1">{selectedRecord.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;
