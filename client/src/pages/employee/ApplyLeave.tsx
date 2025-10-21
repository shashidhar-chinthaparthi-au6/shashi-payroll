import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface LeaveBalance {
  sickLeave: number;
  casualLeave: number;
  annualLeave: number;
  personalLeave: number;
  totalLeave: number;
}

interface LeaveApplication {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface LeaveFormData {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

const ApplyLeave: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    sickLeave: 0,
    casualLeave: 0,
    annualLeave: 0,
    personalLeave: 0,
    totalLeave: 0,
  });
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      showLoader(true);
      const [balanceRes, applicationsRes] = await Promise.all([
        api('/api/employee/leave/balance'),
        api('/api/employee/leave/applications'),
      ]);

      setLeaveBalance(balanceRes?.data || {
        sickLeave: 12,
        casualLeave: 12,
        annualLeave: 21,
        personalLeave: 5,
        totalLeave: 50,
      });

      setLeaveApplications(applicationsRes?.data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to load leave data', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const leaveData = {
        ...formData,
        days: calculateDays(formData.startDate, formData.endDate),
      };

      await api('/api/employee/leave/apply', {
        method: 'POST',
        body: leaveData,
      });

      showToast('Leave application submitted successfully!', 'success');
      setShowForm(false);
      setFormData({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setErrors({});
      fetchLeaveData();
    } catch (error: any) {
      showToast(error.message || 'Failed to submit leave application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Leave Management
      </Typography>

      <Grid container spacing={3}>
        {/* Leave Balance Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon />
            Leave Balance
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {leaveBalance.sickLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sick Leave
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {leaveBalance.casualLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Casual Leave
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {leaveBalance.annualLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual Leave
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {leaveBalance.personalLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personal Leave
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon />
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ mb: 2 }}
              >
                Apply for Leave
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Applications History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Leave Applications History
              </Typography>
              
              {leaveApplications.length === 0 ? (
                <Alert severity="info">
                  No leave applications found.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied Date</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveApplications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell>{application.type}</TableCell>
                          <TableCell>
                            {new Date(application.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(application.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{application.days}</TableCell>
                          <TableCell>
                            <Chip
                              label={application.status}
                              color={getStatusColor(application.status) as any}
                              icon={getStatusIcon(application.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{application.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Application Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Leave Type"
                  >
                    <MenuItem value="sick">Sick Leave</MenuItem>
                    <MenuItem value="casual">Casual Leave</MenuItem>
                    <MenuItem value="annual">Annual Leave</MenuItem>
                    <MenuItem value="personal">Personal Leave</MenuItem>
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error">
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Days"
                  value={calculateDays(formData.startDate, formData.endDate)}
                  disabled
                  helperText="Automatically calculated"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  placeholder="Please provide a detailed reason for your leave application..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplyLeave;
