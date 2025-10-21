import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Settings as SettingsIcon } from '@mui/icons-material';

const EmployeeSettings: React.FC = () => {
  return (
    <PlaceholderPage
      title="Employee Settings"
      description="Personalize your employee portal experience with custom settings, preferences, and account management options."
      icon={<SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Profile Management',
        'Notification Preferences',
        'Theme Customization',
        'Password Management',
        'Privacy Settings',
        'Account Security',
        'Data Export Options',
        'Help & Support'
      ]}
    />
  );
};

export default EmployeeSettings;
