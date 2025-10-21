import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../utils/api';
import { useUI, useAppSettings } from '../../contexts/ThemeContext';

interface Contract {
  _id: string;
  title: string;
  contractorEmployee: { _id: string; name: string; email: string };
  organizationId: { _id: string; name: string };
  startDate: string;
  endDate?: string;
  rateType: 'hourly' | 'daily' | 'monthly' | 'fixed';
  rateAmount: number;
  billingCurrency: string;
  status: 'active' | 'inactive' | 'completed';
}

interface EmployeeOption { _id: string; name: string; email: string; employmentType?: string }
interface OrgOption { _id: string; name: string }

const emptyForm = {
  title: '', contractorEmployee: '', organizationId: '', startDate: '', endDate: '', rateType: 'hourly', rateAmount: 0, billingCurrency: 'USD', status: 'active'
};

const ContractManagement: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const { currency, timezone } = useAppSettings();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const formatAmount = (value: number): string => {
    const c = currency === 'INR' ? 'INR' : 'USD';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(value || 0); } catch { return `${c} ${value ?? 0}`; }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contracts;
    return contracts.filter(c => c.title.toLowerCase().includes(q) || c.contractorEmployee?.name.toLowerCase().includes(q) || c.organizationId?.name.toLowerCase().includes(q));
  }, [contracts, query]);

  const loadData = async () => {
    try {
      showLoader(true);
      const [cRes, contractorsRes, oRes] = await Promise.all([
        api('/api/admin/contracts'),
        api('/api/admin/contractors'),
        api('/api/admin/organizations'),
      ]);
      setContracts(cRes?.data || []);
      setEmployees(contractorsRes?.data || []);
      setOrgs(oRes?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load contracts', 'error');
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
    setForm({ ...(emptyForm as any), billingCurrency: currency });
    setOpen(true);
  };
  const openEdit = (c: Contract) => {
    setEditingId(c._id);
    setForm({
      title: c.title,
      contractorEmployee: c.contractorEmployee?._id || '',
      organizationId: c.organizationId?._id || '',
      startDate: c.startDate?.slice(0, 10) || '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      rateType: c.rateType,
      rateAmount: c.rateAmount,
      billingCurrency: c.billingCurrency,
      status: c.status,
    } as any);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/contracts/${id}`, { method: 'DELETE' });
      showToast('Contract deleted', 'success');
      await loadData();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    } finally { showLoader(false); }
  };

  const save = async () => {
    try {
      setSaving(true);
      showLoader(true);
      const payload: any = { ...form, rateAmount: Number(form.rateAmount) };
      if (!payload.endDate) delete payload.endDate;
      if (editingId) {
        await api(`/api/admin/contracts/${editingId}`, { method: 'PUT', body: payload });
        showToast('Contract updated successfully', 'success');
      } else {
        await api('/api/admin/contracts', { method: 'POST', body: payload });
        showToast('Contract created successfully', 'success');
      }
      setOpen(false); 
      setForm(emptyForm as any); 
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
        <Grid item xs={12} sm={6}><Typography variant="h4" sx={{ fontWeight: 700 }}>Contract Management</Typography></Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} gap={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            Currency: {currency} | Timezone: {timezone}
          </Typography>
          <TextField size="small" placeholder="Search by title, contractor, org" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ width: { xs: '100%', sm: 280 } }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Contract</Button>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No contracts found</Typography>
              <Typography variant="body2" color="text.secondary">Use the New Contract button to add one.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Contractor</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.contractorEmployee ? `${c.contractorEmployee.name} (${c.contractorEmployee.email})` : '-'}</TableCell>
                      <TableCell>{c.organizationId ? c.organizationId.name : '-'}</TableCell>
                      <TableCell>{c.rateType} {formatAmount(c.rateAmount)}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{c.status}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEdit(c)} size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => handleDelete(c._id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingId ? 'Edit Contract' : 'New Contract'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}><TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Contractor" fullWidth value={form.contractorEmployee} onChange={(e) => setForm({ ...form, contractorEmployee: e.target.value })}>
                {employees.map(e => (<MenuItem key={e._id} value={e._id}>{e.name} ({e.email})</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Organization" fullWidth value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}>
                {orgs.map(o => (<MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Rate Type" fullWidth value={form.rateType} onChange={(e) => setForm({ ...form, rateType: e.target.value as any })}>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Rate Amount" type="number" fullWidth value={form.rateAmount} onChange={(e) => setForm({ ...form, rateAmount: e.target.value as any })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Currency" fullWidth value={form.billingCurrency} onChange={(e) => setForm({ ...form, billingCurrency: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" fullWidth value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={save} 
            disabled={saving || !form.title.trim() || !form.contractorEmployee || !form.organizationId || !form.startDate}
          >
            {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;


