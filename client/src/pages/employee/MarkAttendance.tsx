import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface AttendanceStatus {
  canCheckIn: boolean;
  canCheckOut: boolean;
  isCheckedIn: boolean;
  currentStatus: 'present' | 'absent' | 'late' | 'not_checked';
  lastCheckIn?: string;
  lastCheckOut?: string;
  workingHours: number;
  todayHours: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const MarkAttendance: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    canCheckIn: true,
    canCheckOut: false,
    isCheckedIn: false,
    currentStatus: 'not_checked',
    workingHours: 0,
    todayHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [attendanceType, setAttendanceType] = useState('office');

  const fetchAttendanceStatus = useCallback(async () => {
    try {
      showLoader(true);
      const response = await api('/api/employee/attendance/status');
      setAttendanceStatus(response?.data || {
        canCheckIn: true,
        canCheckOut: false,
        isCheckedIn: false,
        currentStatus: 'not_checked',
        workingHours: 0,
        todayHours: 0,
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to load attendance status', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  }, [showLoader, showToast]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchAttendanceStatus();
    getCurrentLocation();
  }, [fetchAttendanceStatus, getCurrentLocation]);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const checkInData = {
        type: attendanceType,
        notes: notes.trim(),
        location: location,
        timestamp: new Date().toISOString(),
      };

      await api('/api/employee/attendance/checkin', {
        method: 'POST',
        body: checkInData,
      });

      showToast('Successfully checked in!', 'success');
      setShowCheckInDialog(false);
      setNotes('');
      fetchAttendanceStatus();
    } catch (error: any) {
      showToast(error.message || 'Failed to check in', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const checkOutData = {
        notes: notes.trim(),
        location: location,
        timestamp: new Date().toISOString(),
      };

      await api('/api/employee/attendance/checkout', {
        method: 'POST',
        body: checkOutData,
      });

      showToast('Successfully checked out!', 'success');
      setShowCheckOutDialog(false);
      setNotes('');
      fetchAttendanceStatus();
    } catch (error: any) {
      showToast(error.message || 'Failed to check out', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      default:
        return 'Not Checked';
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
        Mark Attendance
      </Typography>

      <Grid container spacing={3}>
        {/* Current Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                Today's Status
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={getStatusText(attendanceStatus.currentStatus)}
                  color={getStatusColor(attendanceStatus.currentStatus) as any}
                  sx={{ fontSize: '1rem', fontWeight: 'bold', height: '32px' }}
                />
              </Box>

              {attendanceStatus.lastCheckIn && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Check-in:</strong> {new Date(attendanceStatus.lastCheckIn).toLocaleString()}
                </Typography>
              )}

              {attendanceStatus.lastCheckOut && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Check-out:</strong> {new Date(attendanceStatus.lastCheckOut).toLocaleString()}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary">
                <strong>Today's Hours:</strong> {attendanceStatus.todayHours?.toFixed(1) || '0.0'}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {attendanceStatus.canCheckIn && (
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setShowCheckInDialog(true)}
                    disabled={checkingIn}
                    sx={{ py: 1.5 }}
                  >
                    {checkingIn ? 'Checking In...' : 'Check In'}
                  </Button>
                )}

                {attendanceStatus.canCheckOut && (
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => setShowCheckOutDialog(true)}
                    disabled={checkingOut}
                    sx={{ py: 1.5 }}
                  >
                    {checkingOut ? 'Checking Out...' : 'Check Out'}
                  </Button>
                )}

                {!attendanceStatus.canCheckIn && !attendanceStatus.canCheckOut && (
                  <Alert severity="info">
                    You have already completed your attendance for today.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Info */}
        {location && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon />
                  Location Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Latitude:</strong> {location?.latitude?.toFixed(6) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Longitude:</strong> {location?.longitude?.toFixed(6) || 'N/A'}
                </Typography>
                {location.address && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {location.address}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onClose={() => setShowCheckInDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check In</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Attendance Type</InputLabel>
              <Select
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value)}
                label="Attendance Type"
              >
                <MenuItem value="office">Office</MenuItem>
                <MenuItem value="remote">Remote Work</MenuItem>
                <MenuItem value="field">Field Work</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your check-in..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCheckInDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCheckIn}
            variant="contained"
            color="success"
            disabled={checkingIn}
          >
            {checkingIn ? 'Checking In...' : 'Check In'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={showCheckOutDialog} onClose={() => setShowCheckOutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check Out</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your work today..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCheckOutDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCheckOut}
            variant="contained"
            color="error"
            disabled={checkingOut}
          >
            {checkingOut ? 'Checking Out...' : 'Check Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarkAttendance;
