import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import api from '../../utils/api';
import { useAppSettings } from '../../contexts/ThemeContext';

interface Payslip {
  _id: string;
  date: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'rejected';
  month: string;
  year: number;
}

const EmployeePayslips: React.FC = () => {
  const { currency } = useAppSettings();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching payslips...');
        const response = await api('/api/employee/payslips', {
          method: 'GET'
        });
        console.log('API Response:', response);
        if (response && Array.isArray(response)) {
          setPayslips(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setPayslips(response.data);
        } else {
          setPayslips([]);
          console.warn('Unexpected response format:', response);
        }
      } catch (error: any) {
        console.error('Error fetching payslips:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.status
        });
        setError(error.message || 'Failed to load payslips. Please try again later.');
        setPayslips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  const formatCurrency = (amount: number) => {
    const c = currency === 'INR' ? 'INR' : 'USD';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: c,
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch {
      return `${c} ${amount || 0}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!payslips || payslips.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No payslips found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Payslips
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Currency: {currency}
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Allowances</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payslips.map((payslip) => (
              <TableRow key={payslip._id}>
                <TableCell>
                  {payslip.month} {payslip.year}
                </TableCell>
                <TableCell>{formatCurrency(payslip.basicSalary)}</TableCell>
                <TableCell>{formatCurrency(payslip.allowances)}</TableCell>
                <TableCell>{formatCurrency(payslip.deductions)}</TableCell>
                <TableCell>{formatCurrency(payslip.netSalary)}</TableCell>
                <TableCell>
                  <Chip
                    label={payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                    color={getStatusColor(payslip.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeePayslips; 