import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

const EmployeeLeaves: React.FC = () => {
  return (
    <PlaceholderPage
      title="Leave Management"
      description="Manage your leave requests, view leave balance, and track leave history with an intuitive interface."
      icon={<AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Leave Request Submission',
        'Leave Balance Tracking',
        'Leave History View',
        'Leave Calendar',
        'Approval Status Tracking',
        'Leave Types Management',
        'Holiday Calendar',
        'Leave Policy Information'
      ]}
    />
  );
};

export default EmployeeLeaves;
