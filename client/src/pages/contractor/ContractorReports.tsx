import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

const ContractorReports: React.FC = () => {
  return (
    <PlaceholderPage
      title="Contractor Reports"
      description="Generate detailed reports about your work performance, earnings, and project statistics."
      icon={<AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Performance Reports',
        'Earnings Analytics',
        'Project Statistics',
        'Time Tracking Reports',
        'Client Satisfaction Reports',
        'Work Quality Metrics',
        'Financial Summaries',
        'Custom Report Builder'
      ]}
    />
  );
};

export default ContractorReports;
