import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Settings as SettingsIcon } from '@mui/icons-material';

const ClientSettings: React.FC = () => {
  return (
    <PlaceholderPage
      title="Organization Settings"
      description="Manage your organization settings, preferences, and administrative configurations."
      icon={<SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Organization Profile',
        'User Management',
        'System Preferences',
        'Notification Settings',
        'Security Configuration',
        'Integration Settings',
        'Billing & Subscription',
        'Help & Support'
      ]}
    />
  );
};

export default ClientSettings;
