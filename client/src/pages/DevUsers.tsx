import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy,
  Login as LoginIcon,
} from '@mui/icons-material';
import { API_URL } from '../config';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
    shop: string;
  };
}

interface DevUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface RegistrationForm {
  name: string;
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
}

const DevUsers: React.FC = () => {
  console.log('DevUsers component rendering...');
  
  const [state, setState] = useState<DevUsersState>({
    users: [],
    loading: false,
    error: null,
    success: null,
  });

  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  // Sample development users with known passwords (for quick reference)
  const [devUsers] = useState([
    {
      id: 'dev-super-admin',
      name: 'Super Admin',
      email: 'admin@payroll.com',
      password: 'admin123',
      role: 'admin',
      description: 'Full system access - manage all organizations'
    },
    {
      id: 'dev-org-manager-1',
      name: 'John Smith (Org Manager)',
      email: 'john@company1.com',
      password: 'manager123',
      role: 'client',
      description: 'Organization Manager - manages Company 1'
    },
    {
      id: 'dev-org-manager-2',
      name: 'Sarah Johnson (Org Manager)',
      email: 'sarah@company2.com',
      password: 'manager123',
      role: 'client',
      description: 'Organization Manager - manages Company 2'
    },
    {
      id: 'dev-employee-1',
      name: 'Mike Wilson (Employee)',
      email: 'mike@company1.com',
      password: 'employee123',
      role: 'employee',
      description: 'Employee at Company 1 - HR Department'
    },
    {
      id: 'dev-employee-2',
      name: 'Lisa Brown (Employee)',
      email: 'lisa@company1.com',
      password: 'employee123',
      role: 'employee',
      description: 'Employee at Company 1 - Sales Department'
    },
    {
      id: 'dev-contractor-1',
      name: 'Alex Davis (Contractor)',
      email: 'alex@contractor.com',
      password: 'contractor123',
      role: 'employee',
      description: 'Contractor - assigned to multiple organizations'
    },
  ]);

  useEffect(() => {
    console.log('DevUsers component mounted, fetching users...');
    try {
      fetchUsers();
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  const fetchUsers = async () => {
    console.log('fetchUsers called');
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        console.log('No token found, showing sample users only');
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          users: [], // Empty users array when no token
          error: 'No authentication token found. Showing sample users only. Login to see real database users.' 
        }));
        return;
      }

      console.log('Making API call to:', `${API_URL}/api/users/all`);
      const response = await fetch(`${API_URL}/api/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          users: data.data || [],
          error: null 
        }));
      } else if (response.status === 401) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Authentication failed. Please login again.' 
        }));
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        const errorData = await response.json();
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorData.message || 'Failed to fetch users' 
        }));
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch users' 
      }));
    }
  };

  const handleInputChange = (field: keyof RegistrationForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRegister = async () => {
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const endpoint = `/api/auth/register/${registrationForm.role}`;
      const payload = {
        name: registrationForm.name,
        email: registrationForm.email,
        password: registrationForm.password,
        ...(registrationForm.role === 'employee' && {
          firstName: registrationForm.firstName,
          lastName: registrationForm.lastName,
          department: registrationForm.department,
          position: registrationForm.position,
        }),
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          success: `${registrationForm.role} registered successfully!`,
          error: null 
        }));
        setRegistrationForm({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          firstName: '',
          lastName: '',
          department: '',
          position: '',
        });
        fetchUsers();
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.message || 'Registration failed' 
        }));
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Registration failed' 
      }));
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setState(prev => ({ 
          ...prev, 
          success: 'User deleted successfully',
          error: null 
        }));
        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        setState(prev => ({ 
          ...prev, 
          error: errorData.message || 'Failed to delete user' 
        }));
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to delete user' 
      }));
    }
    setDeleteDialog({ open: false, userId: null });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Development Users Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage test users and view credentials for development
      </Typography>

      {/* Alerts */}
      {state.error && (
        <Alert 
          severity={state.error.includes('No authentication') ? "info" : "error"}
          sx={{ mb: 2 }} 
          onClose={() => setState(prev => ({ ...prev, error: null }))}
          action={
            state.error.includes('No authentication') ? (
              <Button
                color="inherit"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => window.location.href = '/login'}
              >
                Login to See Real Users
              </Button>
            ) : null
          }
        >
          {state.error}
        </Alert>
      )}
      {state.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, success: null }))}>
          {state.success}
        </Alert>
      )}

      {/* Default Development Users */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Default Development Users
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          Use these credentials to test different user roles. Click to copy credentials.
        </Typography>
        
        <Grid container spacing={2}>
          {devUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card sx={{ p: 2, height: '100%' }}>
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Password:</strong> {user.password}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Role:</strong> {user.role}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopy />}
                      onClick={() => copyToClipboard(`${user.email} / ${user.password}`)}
                    >
                      Copy Credentials
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<LoginIcon />}
                      onClick={() => {
                        // Auto-fill login form
                        window.location.href = `/login?email=${user.email}&password=${user.password}`;
                      }}
                    >
                      Quick Login
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Registration Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Register New User
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={registrationForm.role}
                    onChange={handleInputChange('role')}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="client">Client</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={registrationForm.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleInputChange('email')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registrationForm.password}
                  onChange={handleInputChange('password')}
                  required
                />
              </Grid>

              {registrationForm.role === 'employee' && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={registrationForm.firstName}
                      onChange={handleInputChange('firstName')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={registrationForm.lastName}
                      onChange={handleInputChange('lastName')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={registrationForm.department}
                      onChange={handleInputChange('department')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={registrationForm.position}
                      onChange={handleInputChange('position')}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleRegister}
                  disabled={state.loading}
                  startIcon={state.loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {state.loading ? 'Registering...' : 'Register User'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Development Users List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Development Users
              </Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchUsers}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {state.loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      state.users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{user.name}</Typography>
                              {user.employee && (
                                <Typography variant="caption" color="text.secondary">
                                  {user.employee.department} - {user.employee.position}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={user.role === 'admin' ? 'error' : user.role === 'client' ? 'primary' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Delete user">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, userId: user._id })}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteDialog.userId && handleDeleteUser(deleteDialog.userId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DevUsers;
