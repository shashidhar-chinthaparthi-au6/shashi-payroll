import React from 'react';
import PlaceholderPage from '../admin/PlaceholderPage';
import { Settings as SettingsIcon } from '@mui/icons-material';

const ContractorSettings: React.FC = () => {
  return (
    <PlaceholderPage
      title="Contractor Settings"
      description="Manage your contractor account settings, preferences, and profile information."
      icon={<SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      features={[
        'Profile Management',
        'Account Settings',
        'Notification Preferences',
        'Payment Methods',
        'Tax Information',
        'Privacy Settings',
        'Security Options',
        'Help & Support'
      ]}
    />
  );
};

export default ContractorSettings;
