import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Divider, Alert } from '@mui/material';
import { API_URL } from '../config';
import STATUS from '../constants/statusCodes';
import MSG from '../constants/messages';
import { useUI } from '../contexts/ThemeContext';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'employee';
}

interface EmployeeProfile {
  _id: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  bankDetails?: { accountNumber?: string; bankName?: string; ifscCode?: string };
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [, setEmployee] = useState<EmployeeProfile | null>(null);
  const [editUser, setEditUser] = useState({ name: '' });
  const [editEmployee, setEditEmployee] = useState<EmployeeProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const { showLoader, showToast } = useUI();

  // Debug: Check if UI context is available
  console.log('Profile page - showLoader:', showLoader, 'showToast:', showToast);

  const fetchProfile = useCallback(async () => {
    try {
      showLoader(true);
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
      setEditUser({ name: data.user?.name || '' });
      if (data.employee) {
        setEmployee(data.employee);
        setEditEmployee({ ...data.employee });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load profile');
      showToast(e.message || 'Failed to load profile', 'error');
    } finally {
      showLoader(false);
    }
  }, [token, showLoader, showToast]);

  useEffect(() => {
    // Test toast to verify UI context is working
    showToast('Profile page loaded', 'info');
    fetchProfile();
  }, [fetchProfile, showToast]);

  const saveUser = async () => {
    setMessage(null); setError(null);
    try {
      showLoader(true);
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editUser.name }),
      });
      const data = await res.json();
      if (res.status !== STATUS.OK) throw new Error(data.message || MSG.SERVER_ERROR);
      setUser(data.user);
      setMessage('Profile updated');
      showToast('Profile updated', 'success');
    } catch (e: any) {
      setError(e.message);
      showToast(e.message, 'error');
    } finally {
      showLoader(false);
    }
  };

  const saveEmployee = async () => {
    if (!editEmployee) return;
    setMessage(null); setError(null);
    try {
      showLoader(true);
      const res = await fetch(`${API_URL}/api/users/me/employee`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editEmployee),
      });
      const data = await res.json();
      if (res.status !== STATUS.OK) throw new Error(data.message || MSG.SERVER_ERROR);
      setEmployee(data.employee);
      setMessage('Employee profile updated');
      showToast('Employee profile updated', 'success');
    } catch (e: any) {
      setError(e.message);
      showToast(e.message, 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Account</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={editUser.name}
              onChange={(e) => setEditUser({ name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" value={user?.email || ''} disabled />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Role" value={user?.role || ''} disabled />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Button variant="contained" onClick={saveUser}>Save</Button>
        </Box>
      </Paper>

      {user?.role === 'employee' && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Employee Profile</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editEmployee?.phone || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={editEmployee?.address || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={editEmployee?.department || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={editEmployee?.position || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), position: e.target.value })}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Emergency Contact</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Name"
                value={editEmployee?.emergencyContact?.name || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), emergencyContact: { ...(editEmployee?.emergencyContact || {}), name: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={editEmployee?.emergencyContact?.relationship || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), emergencyContact: { ...(editEmployee?.emergencyContact || {}), relationship: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone"
                value={editEmployee?.emergencyContact?.phone || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), emergencyContact: { ...(editEmployee?.emergencyContact || {}), phone: e.target.value } })}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Bank Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Account Number"
                value={editEmployee?.bankDetails?.accountNumber || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), bankDetails: { ...(editEmployee?.bankDetails || {}), accountNumber: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bank Name"
                value={editEmployee?.bankDetails?.bankName || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), bankDetails: { ...(editEmployee?.bankDetails || {}), bankName: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={editEmployee?.bankDetails?.ifscCode || ''}
                onChange={(e) => setEditEmployee({ ...(editEmployee as EmployeeProfile), bankDetails: { ...(editEmployee?.bankDetails || {}), ifscCode: e.target.value } })}
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button variant="contained" onClick={saveEmployee}>Save Employee</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Profile;


