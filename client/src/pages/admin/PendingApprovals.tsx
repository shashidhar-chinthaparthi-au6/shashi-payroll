import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useUI } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface PendingItem {
  _id: string;
  type: 'payroll' | 'leave' | 'contract';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  employee?: { name: string; email: string };
  organization?: { name: string };
  amount?: number;
  days?: number;
}

const PendingApprovals: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingItems = async () => {
    try {
      showLoader(true);
      const res = await api('/api/admin/pending-approvals');
      setPendingItems(res?.data || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load pending approvals', 'error');
    } finally {
      showLoader(false);
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/approve/${type}/${id}`, { method: 'POST' });
      showToast('Item approved successfully', 'success');
      await loadPendingItems();
    } catch (e: any) {
      showToast(e.message || 'Failed to approve', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      showLoader(true);
      await api(`/api/admin/reject/${type}/${id}`, { method: 'POST' });
      showToast('Item rejected', 'info');
      await loadPendingItems();
    } catch (e: any) {
      showToast(e.message || 'Failed to reject', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    loadPendingItems();
  }, []);

  const filteredItems = pendingItems.filter(item => {
    switch (activeTab) {
      case 0: return item.type === 'payroll';
      case 1: return item.type === 'leave';
      case 2: return item.type === 'contract';
      default: return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading pending approvals...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Pending Approvals
      </Typography>

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Payroll" />
            <Tab label="Leaves" />
            <Tab label="Contracts" />
          </Tabs>

          {filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No pending {activeTab === 0 ? 'payroll' : activeTab === 1 ? 'leave' : 'contract'} approvals
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Amount/Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Chip 
                          label={item.type.toUpperCase()} 
                          color="primary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        {item.employee ? `${item.employee.name} (${item.employee.email})` : '-'}
                      </TableCell>
                      <TableCell>
                        {item.amount ? formatAmount(item.amount) : 
                         item.days ? `${item.days} days` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status.toUpperCase()} 
                          color={getStatusColor(item.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApprove(item._id, item.type)}
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleReject(item._id, item.type)}
                        >
                          <RejectIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PendingApprovals;
