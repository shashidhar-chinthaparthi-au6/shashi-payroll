import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  useTheme,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import STATUS from '../../constants/statusCodes';
import MSG from '../../constants/messages';

interface ContractorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails: {
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
  personalDetails: {
    dateOfBirth: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  skills: string[];
  experience: number;
  hourlyRate: number;
  status: string;
  createdAt: string;
}

const ContractorProfile: React.FC = () => {
  const theme = useTheme();
  const { showLoader, showToast } = useUI();
  
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      routingNumber: ''
    },
    personalDetails: {
      dateOfBirth: '',
      emergencyContact: '',
      emergencyPhone: ''
    }
  });
  
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      showLoader(true);
      const response = await api('/api/contractor/profile');
      setProfile(response?.data || null);
      
      if (response?.data) {
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          bankDetails: response.data.bankDetails || {
            accountNumber: '',
            bankName: '',
            routingNumber: ''
          },
          personalDetails: response.data.personalDetails || {
            dateOfBirth: '',
            emergencyContact: '',
            emergencyPhone: ''
          }
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load profile', 'error');
    } finally {
      showLoader(false);
    }
  }, [showLoader, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        bankDetails: profile.bankDetails || {
          accountNumber: '',
          bankName: '',
          routingNumber: ''
        },
        personalDetails: profile.personalDetails || {
          dateOfBirth: '',
          emergencyContact: '',
          emergencyPhone: ''
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showLoader(true);
      
      const response = await api('/api/contractor/profile', {
        method: 'PUT',
        body: formData
      });
      
      if (response.status === STATUS.OK) {
        showToast('Profile updated successfully!', 'success');
        setEditing(false);
        fetchProfile();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
      showLoader(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!profile) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {profile?.name || '-'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profile?.email || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={profile?.status || 'Active'} color="success" size="small" />
                    <Chip label={`${profile?.experience || 0} years experience`} color="default" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Hourly Rate: ${profile?.hourlyRate || 0}/hour
                  </Typography>
                </Box>
                <Box>
                  {!editing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editing ? formData.name : profile?.name || '-'}
                    onChange={editing ? (e) => handleInputChange('name', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile?.email || '-'}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editing ? formData.phone : profile?.phone || '-'}
                    onChange={editing ? (e) => handleInputChange('phone', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={editing ? formData.personalDetails.dateOfBirth : profile?.personalDetails?.dateOfBirth || ''}
                    onChange={editing ? (e) => handleInputChange('personalDetails.dateOfBirth', e.target.value) : undefined}
                    disabled={!editing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Address Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={editing ? formData.address.street : profile?.address?.street || '-'}
                    onChange={editing ? (e) => handleInputChange('address.street', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editing ? formData.address.city : profile?.address?.city || '-'}
                    onChange={editing ? (e) => handleInputChange('address.city', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={editing ? formData.address.state : profile?.address?.state || '-'}
                    onChange={editing ? (e) => handleInputChange('address.state', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={editing ? formData.address.zipCode : profile?.address?.zipCode || '-'}
                    onChange={editing ? (e) => handleInputChange('address.zipCode', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={editing ? formData.address.country : profile?.address?.country || '-'}
                    onChange={editing ? (e) => handleInputChange('address.country', e.target.value) : undefined}
                    disabled={!editing}
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
              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={editing ? formData.bankDetails.bankName : profile?.bankDetails?.bankName || '-'}
                    onChange={editing ? (e) => handleInputChange('bankDetails.bankName', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={editing ? formData.bankDetails.accountNumber : profile?.bankDetails?.accountNumber || '-'}
                    onChange={editing ? (e) => handleInputChange('bankDetails.accountNumber', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Routing Number"
                    value={editing ? formData.bankDetails.routingNumber : profile?.bankDetails?.routingNumber || '-'}
                    onChange={editing ? (e) => handleInputChange('bankDetails.routingNumber', e.target.value) : undefined}
                    disabled={!editing}
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
                    label="Emergency Contact Name"
                    value={editing ? formData.personalDetails.emergencyContact : profile?.personalDetails?.emergencyContact || '-'}
                    onChange={editing ? (e) => handleInputChange('personalDetails.emergencyContact', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={editing ? formData.personalDetails.emergencyPhone : profile?.personalDetails?.emergencyPhone || '-'}
                    onChange={editing ? (e) => handleInputChange('personalDetails.emergencyPhone', e.target.value) : undefined}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractorProfile;
