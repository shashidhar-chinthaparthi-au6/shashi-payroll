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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../utils/api';
import { useUI } from '../../contexts/ThemeContext';

type Role = 'admin' | 'client' | 'employee';

interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  organization?: { _id: string; name: string };
  createdAt?: string;
}

interface Organization {
  _id: string;
  name: string;
  type?: string;
}

const emptyForm = { 
  name: '', 
  email: '', 
  role: 'employee' as Role, 
  password: '',
  organizationId: ''
};

const UserManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filteredUsers = users;
    
    if (q) {
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.role.toLowerCase().includes(q)
      );
    }
    
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    
    return filteredUsers;
  }, [users, query, roleFilter]);

  const loadUsers = async () => {
    try {
      showLoader(true);
      const [usersRes, orgsRes] = await Promise.all([
        api('/api/admin/users'),
        api('/api/admin/organizations')
      ]);
      setUsers(usersRes?.data || []);
      setOrganizations(orgsRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load users', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditingId(user._id);
    setForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      password: '',
      organizationId: user.organizationId || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      showToast('User deleted', 'success');
      await loadUsers();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      showLoader(true);
      
      // Validate organization requirement based on role
      if ((form.role === 'client' || form.role === 'employee') && !form.organizationId) {
        showToast('Please select an organization for this role', 'error');
        return;
      }
      
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password,
        // Only include organizationId for client and employee roles
        ...((form.role === 'client' || form.role === 'employee') && form.organizationId && { organizationId: form.organizationId })
      };
      
      if (editingId) {
        await api(`/api/admin/users/${editingId}`, { method: 'PUT', body: payload });
        showToast('User updated successfully', 'success');
      } else {
        await api('/api/admin/users', { method: 'POST', body: payload });
        showToast('User created successfully', 'success');
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadUsers();
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
      showLoader(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>User Management</Typography>
        </Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} gap={1}>
          <TextField
            size="small"
            placeholder="Search by name, email, role"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <TextField
            size="small"
            select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 120 } }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="client">Org Manager</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New User</Button>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Admins</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'client').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Org Managers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'employee').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Employees</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No users found</Typography>
              <Typography variant="body2" color="text.secondary">Use the New User button to add one.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u._id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                      <TableCell>
                        {u.role === 'admin' ? 'Global Admin' : (u.organization?.name || 'Not Assigned')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEdit(u)} size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => handleDelete(u._id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Name" 
                fullWidth 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Email" 
                type="email" 
                fullWidth 
                disabled={!!editingId} 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                label="Role" 
                fullWidth 
                value={form.role} 
                onChange={(e) => setForm({ ...form, role: e.target.value as Role, organizationId: '' })}>
                <MenuItem value="admin">Super Admin (Global Access)</MenuItem>
                <MenuItem value="client">Organization Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label={editingId ? 'New Password (optional)' : 'Password'} 
                type="password" 
                fullWidth 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required={!editingId}
              />
            </Grid>
            {(form.role === 'client' || form.role === 'employee') && (
              <Grid item xs={12}>
                <TextField 
                  select 
                  label="Organization" 
                  fullWidth 
                  value={form.organizationId} 
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                  required
                >
                  <MenuItem value="">Select Organization</MenuItem>
                  {organizations.map(org => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name} {org.type && `(${org.type})`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {form.role === 'admin' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Super Admin:</strong> Global access across all organizations. No organization assignment needed.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={save} 
            disabled={saving || !form.name.trim() || !form.email.trim() || (!editingId && !form.password.trim())}
          >
            {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;


