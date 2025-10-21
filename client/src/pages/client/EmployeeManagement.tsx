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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  employmentType: string;
  status?: string;
  hireDate?: string;
  manager?: string;
}

const emptyForm = { 
  name: '', 
  email: '', 
  phone: '', 
  position: '', 
  department: '', 
  salary: 0,
  employmentType: 'full_time',
  status: 'active'
};

const EmployeeManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    let filteredEmployees = employees;
    
    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredEmployees = filteredEmployees.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.email.toLowerCase().includes(q) || 
        (e.position || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filteredEmployees = filteredEmployees.filter(e => e.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter) {
      filteredEmployees = filteredEmployees.filter(e => e.employmentType === typeFilter);
    }
    
    return filteredEmployees;
  }, [employees, query, statusFilter, typeFilter]);

  const loadEmployees = async () => {
    try {
      showLoader(true);
      const response = await api('/api/client/employees');
      setEmployees(response?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load employees', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/client/employees/${id}`, { method: 'DELETE' });
      showToast('Employee deleted successfully', 'success');
      await loadEmployees();
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
        await api(`/api/client/employees/${editingId}`, { method: 'PUT', body: form });
        showToast('Employee updated successfully', 'success');
      } else {
        await api('/api/client/employees', { method: 'POST', body: form });
        showToast('Employee created successfully', 'success');
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadEmployees();
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

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'success';
      case 'part_time': return 'info';
      case 'contract': return 'warning';
      case 'intern': return 'secondary';
      default: return 'default';
    }
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
    loadEmployees();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Employee
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
                    Total Employees
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {employees.length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                  <PersonIcon />
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
                    Full Time
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {employees.filter(e => e.employmentType === 'full_time').length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', fontSize: 40 }}>
                  <WorkIcon />
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
                    Contractors
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {employees.filter(e => e.employmentType === 'contract').length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main', fontSize: 40 }}>
                  <WorkIcon />
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
                    Active
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    {employees.filter(e => e.status === 'active').length}
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', fontSize: 40 }}>
                  <ScheduleIcon />
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
            <Grid item xs={12} sm={4}>
              <TextField
                size="small"
                placeholder="Search employees..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Employment Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
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
                  setTypeFilter('');
                }}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No employees found</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the filters above or add a new employee.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Employment Type</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Hire Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((employee) => (
                    <TableRow key={employee._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{employee.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {employee.email}
                            </Typography>
                            {employee.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {employee.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {employee.position || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.department || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.employmentType.replace('_', ' ').toUpperCase()}
                          color={getEmploymentTypeColor(employee.employmentType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {employee.salary ? formatCurrency(employee.salary) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.status || 'active'}
                          color={getStatusColor(employee.status || 'active')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}
                        </Typography>
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
                              setEditingId(employee._id);
                              setForm({
                                name: employee.name,
                                email: employee.email,
                                phone: employee.phone || '',
                                position: employee.position || '',
                                department: employee.department || '',
                                salary: employee.salary || 0,
                                employmentType: employee.employmentType,
                                status: employee.status || 'active'
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
                            onClick={() => handleDelete(employee._id)}
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

      {/* Add/Edit Employee Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
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
                label="Salary"
                type="number"
                fullWidth
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  label="Employment Type"
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
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

export default EmployeeManagement;