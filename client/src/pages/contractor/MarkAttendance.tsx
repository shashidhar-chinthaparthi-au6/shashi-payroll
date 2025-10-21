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
  Avatar,
  useTheme,
  Alert,
  Paper
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import STATUS from '../../constants/statusCodes';
import MSG from '../../constants/messages';

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  todayHours: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const MarkAttendance: React.FC = () => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    isCheckedIn: false,
    todayHours: 0
  });
  
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendanceStatus = useCallback(async () => {
    try {
      showLoader(true);
      const response = await api('/api/contractor/attendance/status');
      setAttendanceStatus(response?.data || { isCheckedIn: false, todayHours: 0 });
    } catch (e: any) {
      showToast(e.message || 'Failed to load attendance status', 'error');
    } finally {
      showLoader(false);
    }
  }, [showLoader, showToast]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          showToast('Unable to get location', 'warning');
        }
      );
    } else {
      showToast('Geolocation not supported', 'warning');
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
    getCurrentLocation();
  }, [fetchAttendanceStatus]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      showLoader(true);
      
      const response = await api('/api/contractor/attendance/checkin', {
        method: 'POST',
        body: {
          type: 'office',
          notes,
          location,
          timestamp: new Date().toISOString()
        }
      });
      
      if (response.status === STATUS.OK) {
        showToast('Checked in successfully!', 'success');
        fetchAttendanceStatus();
        setNotes('');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to check in', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      showLoader(true);
      
      const response = await api('/api/contractor/attendance/checkout', {
        method: 'POST',
        body: {
          notes,
          timestamp: new Date().toISOString()
        }
      });
      
      if (response.status === STATUS.OK) {
        showToast('Checked out successfully!', 'success');
        fetchAttendanceStatus();
        setNotes('');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to check out', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={attendanceStatus.isCheckedIn ? <CheckCircleIcon /> : <ScheduleIcon />}
                  label={attendanceStatus.isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  color={attendanceStatus.isCheckedIn ? 'success' : 'default'}
                  sx={{ mb: 2 }}
                />
                
                {attendanceStatus.checkInTime && (
                  <Typography variant="body2" color="text.secondary">
                    Check-in: {new Date(attendanceStatus.checkInTime).toLocaleString()}
                  </Typography>
                )}
                
                {attendanceStatus.checkOutTime && (
                  <Typography variant="body2" color="text.secondary">
                    Check-out: {new Date(attendanceStatus.checkOutTime).toLocaleString()}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Today's Hours: {attendanceStatus.todayHours?.toFixed(1) || '0.0'}h
                </Typography>
              </Box>
              
              {location && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                {!attendanceStatus.isCheckedIn ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    onClick={handleCheckIn}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    Check In
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    onClick={handleCheckOut}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    Check Out
                  </Button>
                )}
                
                <Button
                  variant="text"
                  onClick={getCurrentLocation}
                  startIcon={<LocationIcon />}
                >
                  Update Location
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarkAttendance;
