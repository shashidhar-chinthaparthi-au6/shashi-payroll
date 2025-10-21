import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface EmployeeProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  hireDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  status: 'active' | 'inactive';
  salary: number;
  manager: {
    name: string;
    email: string;
  };
  personalDetails: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    dateOfBirth: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

const EmployeeProfile: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployeeProfile>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      showLoader(true);
      const response = await api('/api/employee/profile');
      setProfile(response?.data || null);
    } catch (error: any) {
      showToast(error.message || 'Failed to load profile', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        phone: profile.phone,
        personalDetails: { ...profile.personalDetails },
        bankDetails: { ...profile.bankDetails },
      });
      setShowEditDialog(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (editData.personalDetails?.address && !editData.personalDetails.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (editData.bankDetails?.bankName && !editData.bankDetails.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await api('/api/employee/profile', {
        method: 'PUT',
        body: editData,
      });

      showToast('Profile updated successfully!', 'success');
      setShowEditDialog(false);
      fetchProfile();
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'primary';
      case 'part-time':
        return 'secondary';
      case 'contract':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load profile information.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Avatar
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {profile?.name || '-'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profile?.position || '-'} • {profile?.department || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={profile?.status || '-'}
                      color={getStatusColor(profile?.status || 'active') as any}
                      size="small"
                    />
                    <Chip
                      label={profile?.employmentType || '-'}
                      color={getEmploymentTypeColor(profile?.employmentType || 'full-time') as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={profile?.employeeId || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={profile?.name || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile?.email || '-'}
                    disabled
                    variant="outlined"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profile?.phone || '-'}
                    disabled
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={profile?.position || '-'}
                    disabled
                    variant="outlined"
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profile?.department || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hire Date"
                    value={profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString() : '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Manager"
                    value={profile?.manager ? `${profile.manager.name} (${profile.manager.email})` : '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon />
                Personal Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profile?.personalDetails?.address || '-'}
                    disabled
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profile?.personalDetails?.city || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profile?.personalDetails?.state || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={profile?.personalDetails?.country || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={profile?.personalDetails?.postalCode || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={profile?.personalDetails?.dateOfBirth ? new Date(profile.personalDetails.dateOfBirth).toLocaleDateString() : '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BankIcon />
                Bank Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={profile?.bankDetails?.bankName || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={profile?.bankDetails?.accountNumber || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    value={profile?.bankDetails?.ifscCode || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Branch"
                    value={profile?.bankDetails?.branch || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={profile?.personalDetails?.emergencyContact?.name || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile?.personalDetails?.emergencyContact?.phone || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={profile?.personalDetails?.emergencyContact?.relationship || '-'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        {profile?.documents && profile.documents.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Documents
                </Typography>
                <Grid container spacing={2}>
                  {profile?.documents?.map((doc, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {doc.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editData.personalDetails?.address || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    personalDetails: {
                      ...editData.personalDetails!,
                      address: e.target.value,
                    },
                  })}
                  error={!!errors.address}
                  helperText={errors.address}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={editData.bankDetails?.bankName || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    bankDetails: {
                      ...editData.bankDetails!,
                      bankName: e.target.value,
                    },
                  })}
                  error={!!errors.bankName}
                  helperText={errors.bankName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={editData.bankDetails?.accountNumber || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    bankDetails: {
                      ...editData.bankDetails!,
                      accountNumber: e.target.value,
                    },
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProfile;
