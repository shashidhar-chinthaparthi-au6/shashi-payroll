import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Payment as PaymentIcon } from '@mui/icons-material';

const ContractorPayments: React.FC = () => {
  return (
    <PlaceholderPage
      title="Payment History"
      description="View your payment history, track earnings, and manage financial records as a contractor."
      icon={<PaymentIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Payment History',
        'Earnings Tracking',
        'Payment Status',
        'Tax Documents',
        'Payment Methods',
        'Financial Reports',
        'Invoice Management',
        'Payment Notifications'
      ]}
    />
  );
};

export default ContractorPayments;
