import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../../utils/api';

interface AttendanceRecord {
  date: string;
  checkIn: {
    time: string;
    method: 'manual' | 'qr';
  };
  checkOut?: {
    time: string;
    method: 'manual' | 'qr';
  };
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

const EmployeeAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api('/api/employee/attendance', {
          method: 'GET'
        });
        console.log('API Response:', response); // Debug log
        if (response && Array.isArray(response)) {
          setAttendance(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setAttendance(response.data);
        } else {
          setAttendance([]);
          console.warn('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setError('Failed to load attendance records. Please try again later.');
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const calculateHours = (checkIn: string, checkOut?: string) => {
    try {
      if (!checkOut) return '-';
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const hours = diff / (1000 * 60 * 60);
      return hours.toFixed(1);
    } catch (error) {
      console.error('Error calculating hours:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No attendance records found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {record.checkIn && (
                    <>
                      {formatTime(record.checkIn.time)}
                      <Typography variant="caption" display="block" color="textSecondary">
                        ({record.checkIn.method})
                      </Typography>
                    </>
                  )}
                </TableCell>
                <TableCell>
                  {record.checkOut ? (
                    <>
                      {formatTime(record.checkOut.time)}
                      <Typography variant="caption" display="block" color="textSecondary">
                        ({record.checkOut.method})
                      </Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    color={
                      record.status === 'present'
                        ? 'success.main'
                        : record.status === 'late'
                        ? 'warning.main'
                        : 'error.main'
                    }
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {record.checkIn && calculateHours(record.checkIn.time, record.checkOut?.time)}
                </TableCell>
                <TableCell>{record.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeAttendance; 