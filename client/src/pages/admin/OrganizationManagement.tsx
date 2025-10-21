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
  Divider,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../utils/api';
import { useUI } from '../../contexts/ThemeContext';

interface Org {
  _id: string;
  name: string;
  type?: string;
  manager?: { _id: string; name: string; email: string } | null;
  isActive?: boolean;
}

interface UserOption { _id: string; name: string; email: string; role: string; }

const emptyForm = { 
  name: '', 
  type: 'company', 
  manager: '',
  adminEmail: '',
  adminName: ''
};

const OrganizationManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(o => o.name.toLowerCase().includes(q) || (o.type || '').toLowerCase().includes(q) || (o.manager?.name || '').toLowerCase().includes(q));
  }, [orgs, query]);

  const loadData = async () => {
    try {
      showLoader(true);
      const [orgRes, userRes] = await Promise.all([
        api('/api/admin/organizations'),
        api('/api/admin/users'),
      ]);
      setOrgs(orgRes?.data || []);
      setUsers((userRes?.data || []).filter((u: UserOption) => u.role === 'admin' || u.role === 'client'));
    } catch (e: any) {
      showToast(e.message || 'Failed to load organizations', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (org: Org) => {
    setEditingId(org._id);
    setForm({ 
      name: org.name, 
      type: org.type || 'company', 
      manager: org.manager?._id || '',
      adminEmail: '',
      adminName: ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/organizations/${id}`, { method: 'DELETE' });
      showToast('Organization deleted', 'success');
      await loadData();
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
      const payload: any = { 
        name: form.name, 
        type: form.type, 
        manager: form.manager || undefined,
        adminEmail: form.adminEmail || undefined,
        adminName: form.adminName || undefined
      };
      if (editingId) {
        await api(`/api/admin/organizations/${editingId}`, { method: 'PUT', body: payload });
        showToast('Organization updated successfully', 'success');
      } else {
        const response = await api('/api/admin/organizations', { method: 'POST', body: payload });
        if (response?.data?.credentials) {
          const { email, password, role } = response.data.credentials;
          showToast(
            `Organization created! Admin credentials: ${email} / ${password}`, 
            'success'
          );
        } else {
          showToast('Organization created successfully', 'success');
        }
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Organization Management</Typography>
        </Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} gap={1}>
          <TextField
            size="small"
            placeholder="Search by name, type, manager"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Organization</Button>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No organizations found</Typography>
              <Typography variant="body2" color="text.secondary">Use the New Organization button to add one.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o._id} hover>
                      <TableCell>{o.name}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{o.type || '-'}</TableCell>
                      <TableCell>{o.manager ? `${o.manager.name} (${o.manager.email})` : '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEdit(o)} size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => handleDelete(o._id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingId ? 'Edit Organization' : 'New Organization'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Organization Name" 
                fullWidth 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Type" 
                fullWidth 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="subtitle2" color="primary">Admin Credentials</Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Admin Name" 
                fullWidth 
                value={form.adminName} 
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Admin Email" 
                fullWidth 
                type="email"
                value={form.adminEmail} 
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Default Password:</strong> Admin@123<br/>
                  <strong>Role:</strong> Organization Admin<br/>
                  <strong>Access:</strong> Full control over this organization
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField select label="Existing Manager (optional)" fullWidth value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}>
                <MenuItem value="">Create new admin (recommended)</MenuItem>
                {users.map(u => (
                  <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={save} 
            disabled={saving || !form.name.trim()}
          >
            {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationManagement;


