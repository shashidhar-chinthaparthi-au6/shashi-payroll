import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  useTheme,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import STATUS from '../../constants/statusCodes';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  contractTitle: string;
  organizationName: string;
  periodStart: string;
  periodEnd: string;
  billableHours: number;
  rateAmount: number;
  grossAmount: number;
  deductions: Array<{
    type: string;
    amount: number;
  }>;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  generatedAt: string;
  paidAt?: string;
}

const ViewInvoices: React.FC = () => {
  const { showLoader, showToast } = useUI();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInvoices = useCallback(async () => {
    try {
      showLoader(true);
      const response = await api('/api/contractor/invoices');
      setInvoices(response?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load invoices', 'error');
    } finally {
      showLoader(false);
    }
  }, [showLoader, showToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.contractTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = async (invoiceId: string) => {
    try {
      showLoader(true);
      const response = await api(`/api/contractor/invoices/${invoiceId}/download`, {
        method: 'GET'
      });
      
      if (response.status === STATUS.OK) {
        showToast('Invoice downloaded successfully!', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to download invoice', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleView = async (invoiceId: string) => {
    try {
      showLoader(true);
      const response = await api(`/api/contractor/invoices/${invoiceId}`);
      
      if (response.status === STATUS.OK) {
        showToast('Invoice details loaded!', 'success');
        // TODO: Open invoice details modal
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load invoice details', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        View Invoices
      </Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={fetchInvoices}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Invoices ({filteredInvoices.length})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Contract</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.contractTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.organizationName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.billableHours}h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${invoice.netAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleView(invoice._id)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(invoice._id)}
                        title="Download PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredInvoices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No invoices found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewInvoices;
