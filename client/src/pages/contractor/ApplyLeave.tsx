import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import STATUS from '../../constants/statusCodes';
import MSG from '../../constants/messages';

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
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
  rejectionReason?: string;
}

const ApplyLeave: React.FC = () => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    total: 0,
    used: 0,
    remaining: 0
  });
  
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [formData, setFormData] = useState({
    type: 'sick',
    startDate: null as Date | null,
    endDate: null as Date | null,
    reason: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveData = useCallback(async () => {
    try {
      showLoader(true);
      const [balanceRes, applicationsRes] = await Promise.all([
        api('/api/contractor/leave/balance'),
        api('/api/contractor/leave/applications')
      ]);
      
      setLeaveBalance(balanceRes?.data || { total: 0, used: 0, remaining: 0 });
      setLeaveApplications(applicationsRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load leave data', 'error');
    } finally {
      showLoader(false);
    }
  }, [showLoader, showToast]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'rejected': return <CancelIcon color="error" />;
      default: return <PendingIcon />;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      showToast('Please select start and end dates', 'error');
      return;
    }
    
    if (formData.startDate > formData.endDate) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      showLoader(true);
      
      const response = await api('/api/contractor/leave/apply', {
        method: 'POST',
        body: {
          type: formData.type,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          reason: formData.reason
        }
      });
      
      if (response.status === STATUS.OK) {
        showToast('Leave application submitted successfully!', 'success');
        setFormData({
          type: 'sick',
          startDate: null,
          endDate: null,
          reason: ''
        });
        fetchLeaveData();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to submit leave application', 'error');
    } finally {
      setSubmitting(false);
      showLoader(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Apply Leave
      </Typography>
      
      <Grid container spacing={3}>
        {/* Leave Balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Balance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Leave Days
                </Typography>
                <Typography variant="h6">
                  {leaveBalance.total} days
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Used Leave Days
                </Typography>
                <Typography variant="h6">
                  {leaveBalance.used} days
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Remaining Leave Days
                </Typography>
                <Typography variant="h6" color="primary">
                  {leaveBalance.remaining} days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Apply Leave Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Apply for Leave
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Leave Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        label="Leave Type"
                      >
                        <MenuItem value="sick">Sick Leave</MenuItem>
                        <MenuItem value="personal">Personal Leave</MenuItem>
                        <MenuItem value="vacation">Vacation</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<EventIcon />}
                      disabled={submitting}
                      sx={{ mt: 2 }}
                    >
                      Submit Leave Application
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Leave History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Leave History
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <Typography variant="body2" textTransform="capitalize">
                        {application.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.startDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.days} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(application.status)}
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {leaveApplications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No leave applications found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplyLeave;
