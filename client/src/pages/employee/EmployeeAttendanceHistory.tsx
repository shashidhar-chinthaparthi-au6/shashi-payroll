import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { History as HistoryIcon } from '@mui/icons-material';

const EmployeeAttendanceHistory: React.FC = () => {
  return (
    <PlaceholderPage
      title="Attendance History"
      description="View your complete attendance history with detailed records, time tracking, and attendance patterns."
      icon={<HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Complete Attendance Records',
        'Time Tracking Details',
        'Attendance Patterns',
        'Monthly/Weekly Views',
        'Export Attendance Data',
        'Attendance Statistics',
        'Late Arrival Tracking',
        'Overtime Calculations'
      ]}
    />
  );
};

export default EmployeeAttendanceHistory;
