import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { History as HistoryIcon } from '@mui/icons-material';

const ContractorHistory: React.FC = () => {
  return (
    <PlaceholderPage
      title="Work History"
      description="Track your complete work history, project assignments, and performance metrics as a contractor."
      icon={<HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Project History',
        'Work Assignments',
        'Performance Metrics',
        'Client Feedback',
        'Earnings History',
        'Time Tracking',
        'Project Completion Status',
        'Work Quality Reports'
      ]}
    />
  );
};

export default ContractorHistory;
