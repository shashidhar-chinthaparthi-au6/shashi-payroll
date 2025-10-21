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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface Contractor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  rateAmount?: number;
  rateType?: string;
  status?: string;
  totalHours?: number;
  totalRevenue?: number;
  activeContracts?: number;
}

const emptyForm = { 
  name: '', 
  email: '', 
  phone: '', 
  position: '', 
  department: '', 
  rateAmount: 0,
  rateType: 'hourly',
  status: 'active'
};

const ContractorManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    let filteredContractors = contractors;
    
    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredContractors = filteredContractors.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        (c.position || '').toLowerCase().includes(q) ||
        (c.department || '').toLowerCase().includes(q)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filteredContractors = filteredContractors.filter(c => c.status === statusFilter);
    }
    
    return filteredContractors;
  }, [contractors, query, statusFilter]);

  const loadContractors = async () => {
    try {
      showLoader(true);
      const response = await api('/api/client/contractors');
      setContractors(response?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load contractors', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/client/contractors/${id}`, { method: 'DELETE' });
      showToast('Contractor deleted successfully', 'success');
      await loadContractors();
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
      if (editingId) {
        await api(`/api/client/contractors/${editingId}`, { method: 'PUT', body: form });
        showToast('Contractor updated successfully', 'success');
      } else {
        await api('/api/client/contractors', { method: 'POST', body: form });
        showToast('Contractor created successfully', 'success');
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadContractors();
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
      showLoader(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  useEffect(() => {
    loadContractors();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Contractor Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Contractor
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Contractors
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {contractors.length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                  <AssignmentIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Active Contractors
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {contractors.filter(c => c.status === 'active').length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', fontSize: 40 }}>
                  <ScheduleIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Active Contracts
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {contractors.reduce((sum, c) => sum + (c.activeContracts || 0), 0)}
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', fontSize: 40 }}>
                  <AssignmentIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(contractors.reduce((sum, c) => sum + (c.totalRevenue || 0), 0))}
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main', fontSize: 40 }}>
                  <MoneyIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                placeholder="Search contractors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setQuery('');
                  setStatusFilter('');
                }}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contractors Table */}
      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No contractors found</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the filters above or add a new contractor.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contractor</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Active Contracts</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((contractor) => (
                    <TableRow key={contractor._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                            {contractor.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{contractor.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contractor.email}
                            </Typography>
                            {contractor.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {contractor.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {contractor.position || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contractor.department || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {contractor.rateAmount ? formatCurrency(contractor.rateAmount) : '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per {contractor.rateType || 'hour'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {contractor.activeContracts || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {contractor.totalHours || 0}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {contractor.totalRevenue ? formatCurrency(contractor.totalRevenue) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={contractor.status || 'active'}
                          color={getStatusColor(contractor.status || 'active')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="info">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setEditingId(contractor._id);
                              setForm({
                                name: contractor.name,
                                email: contractor.email,
                                phone: contractor.phone || '',
                                position: contractor.position || '',
                                department: contractor.department || '',
                                rateAmount: contractor.rateAmount || 0,
                                rateType: contractor.rateType || 'hourly',
                                status: contractor.status || 'active'
                              });
                              setOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(contractor._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contractor Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Contractor' : 'Add Contractor'}</DialogTitle>
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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={!!editingId}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Position"
                fullWidth
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                fullWidth
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rate Amount"
                type="number"
                fullWidth
                value={form.rateAmount}
                onChange={(e) => setForm({ ...form, rateAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rate Type</InputLabel>
                <Select
                  value={form.rateType}
                  onChange={(e) => setForm({ ...form, rateType: e.target.value })}
                  label="Rate Type"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !form.name.trim() || !form.email.trim()}
          >
            {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractorManagement;
