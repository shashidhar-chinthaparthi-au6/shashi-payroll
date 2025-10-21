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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  Alert,
  Divider,
  Tooltip,
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
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import { useAppSettings } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface Contractor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status?: string;
  employmentType: string;
  totalAssignments: number;
  totalHours: number;
  totalRevenue: number;
  utilizationRate: number;
  activeContracts: number;
  lastAssignment?: string;
  averageRating?: number;
}

interface ContractorStats {
  totalContractors: number;
  activeContractors: number;
  totalAssignments: number;
  totalRevenue: number;
  averageUtilization: number;
  topPerformers: Contractor[];
  recentActivity: any[];
}

interface AssignmentHistory {
  _id: string;
  contractorName: string;
  organizationName: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  rateAmount: number;
  totalHours: number;
  revenue: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card sx={{ height: '100%', overflow: 'hidden' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
          {trend !== undefined && (
            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              {trend > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color, fontSize: 40 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const EnhancedContractorManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const { currency } = useAppSettings();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [stats, setStats] = useState<ContractorStats>({
    totalContractors: 0,
    activeContractors: 0,
    totalAssignments: 0,
    totalRevenue: 0,
    averageUtilization: 0,
    topPerformers: [],
    recentActivity: []
  });
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', department: '' });
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const formatCurrency = (amount: number) => {
    const c = currency === 'INR' ? 'INR' : 'USD';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: c,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${c} ${amount}`;
    }
  };

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
    
    // Sort
    filteredContractors.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'utilization':
          return b.utilizationRate - a.utilizationRate;
        case 'assignments':
          return b.totalAssignments - a.totalAssignments;
        default:
          return 0;
      }
    });
    
    return filteredContractors;
  }, [contractors, query, statusFilter, sortBy]);

  const loadData = async () => {
    try {
      showLoader(true);
      const [contractorsRes, statsRes, historyRes] = await Promise.all([
        api('/api/admin/contractors'),
        api('/api/admin/contractor-stats'),
        api('/api/admin/contractor-assignments')
      ]);
      
      setContractors(contractorsRes?.data || []);
      setStats(statsRes?.data || stats);
      setAssignmentHistory(historyRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load contractor data', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/contractors/${id}`, { method: 'DELETE' });
      showToast('Contractor deleted successfully', 'success');
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
      if (editingId) {
        await api(`/api/admin/contractors/${editingId}`, { method: 'PUT', body: form });
        showToast('Contractor updated successfully', 'success');
      } else {
        await api('/api/admin/contractors', { method: 'POST', body: form });
        showToast('Contractor created successfully', 'success');
      }
      setOpen(false);
      setForm({ name: '', email: '', phone: '', position: '', department: '' });
      setEditingId(null);
      await loadData();
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
      showLoader(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      showLoader(true);
      const res = await api('/api/admin/export-contractors', {
        method: 'POST',
        body: { format, filter: { query, status: statusFilter, sort: sortBy } }
      });
      
      // Create download link
      const blob = new Blob([res.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contractors-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showToast(`Contractors exported as ${format.toUpperCase()}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to export contractors', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Enhanced Contractor Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Contractor
          </Button>
        </Box>
      </Box>

      {/* Statistics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contractors"
            value={stats.totalContractors}
            icon={<BusinessIcon />}
            color="primary.main"
            trend={5.2}
            subtitle="All contractors"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Contractors"
            value={stats.activeContractors}
            icon={<AssignmentIcon />}
            color="success.main"
            trend={8.3}
            subtitle="Currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<MoneyIcon />}
            color="warning.main"
            trend={12.5}
            subtitle="Generated revenue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Utilization"
            value={`${stats.averageUtilization}%`}
            icon={<TrendingUpIcon />}
            color="info.main"
            trend={2.1}
            subtitle="System average"
          />
        </Grid>
      </Grid>

      {/* Top Performers Alert */}
      {stats.topPerformers.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">
            Top Performers: {stats.topPerformers.slice(0, 3).map(p => p.name).join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Enhanced Contractor Management */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Contractor List" />
            <Tab label="Performance Analytics" />
            <Tab label="Assignment History" />
            <Tab label="Revenue Analysis" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Contractor List Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Filters and Controls */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    placeholder="Search contractors..."
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
                      <MenuItem value="on-leave">On Leave</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="utilization">Utilization</MenuItem>
                      <MenuItem value="assignments">Assignments</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExport('excel')}
                      size="small"
                    >
                      Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Contractors Table */}
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
                        <TableCell>Assignments</TableCell>
                        <TableCell>Revenue</TableCell>
                        <TableCell>Utilization</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((contractor) => (
                        <TableRow key={contractor._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {contractor.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{contractor.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {contractor.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{contractor.position || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contractor.department || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {contractor.totalAssignments}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contractor.activeContracts} active
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {formatCurrency(contractor.totalRevenue)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contractor.totalHours}h total
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={contractor.utilizationRate || 0}
                                sx={{ width: 60, mr: 1, height: 6 }}
                              />
                              <Typography variant="body2">
                                {contractor.utilizationRate}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={contractor.status || 'active'}
                              color={contractor.status === 'active' ? 'success' : 'default'}
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
                                    department: contractor.department || ''
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
            </Box>
          )}

          {/* Performance Analytics Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Performance Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Performers
                      </Typography>
                      {stats.topPerformers.slice(0, 5).map((contractor, index) => (
                        <Box key={contractor._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              #{index + 1} {contractor.name}
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              {formatCurrency(contractor.totalRevenue)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2">Utilization: {contractor.utilizationRate}%</Typography>
                            <Typography variant="body2">Assignments: {contractor.totalAssignments}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Utilization Distribution
                      </Typography>
                      {filtered.slice(0, 5).map((contractor) => (
                        <Box key={contractor._id} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2">{contractor.name}</Typography>
                            <Typography variant="body2">{contractor.utilizationRate}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={contractor.utilizationRate || 0}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Assignment History Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Assignment History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contractor</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Assignment</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignmentHistory.map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell>{assignment.contractorName}</TableCell>
                        <TableCell>{assignment.organizationName}</TableCell>
                        <TableCell>{assignment.title}</TableCell>
                        <TableCell>
                          {new Date(assignment.startDate).toLocaleDateString()} - 
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(assignment.revenue)}</TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status}
                            color={assignment.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Revenue Analysis Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Revenue Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue by Contractor
                      </Typography>
                      {filtered.slice(0, 5).map((contractor) => (
                        <Box key={contractor._id} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2">{contractor.name}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(contractor.totalRevenue)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(0, Math.min(100, (contractor.totalRevenue / Math.max(...filtered.map(c => c.totalRevenue))) * 100))}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Summary
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Revenue Generated
                        </Typography>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {formatCurrency(stats.totalRevenue)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Average per Contractor
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(stats.totalRevenue / Math.max(stats.totalContractors, 1))}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Assignments
                        </Typography>
                        <Typography variant="h6">
                          {stats.totalAssignments}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contractor Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Contractor' : 'New Contractor'}</DialogTitle>
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
            <Grid item xs={12}>
              <TextField
                label="Department"
                fullWidth
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
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

export default EnhancedContractorManagement;