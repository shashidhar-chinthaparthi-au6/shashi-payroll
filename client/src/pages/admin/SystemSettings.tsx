import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, MenuItem, Switch, FormControlLabel, Button } from '@mui/material';
import { useUI, useAppSettings, useAppTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

interface Settings { defaultCurrency: 'INR' | 'USD'; defaultTimezone: string; emailNotifications: boolean; maintenanceMode: boolean }

const SystemSettingsPage: React.FC = () => {
  const { showLoader, showToast } = useUI();
  const { setAppSettings } = useAppSettings();
  const { mode, toggleTheme } = useAppTheme();
  const [settings, setSettings] = useState<Settings>({ defaultCurrency: 'INR', defaultTimezone: 'UTC', emailNotifications: true, maintenanceMode: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { showLoader(true); const res = await api('/api/admin/settings'); setSettings(res?.data || settings); } catch (e: any) { showToast(e.message || 'Failed to load settings', 'error'); } finally { showLoader(false); }
  };

  const save = async () => {
    try {
      setSaving(true); showLoader(true);
      await api('/api/admin/settings', { method: 'PUT', body: settings });
      // Reflect globally
      setAppSettings({ currency: settings.defaultCurrency, timezone: settings.defaultTimezone });
      showToast(`Settings updated - Currency: ${settings.defaultCurrency}, Timezone: ${settings.defaultTimezone}`, 'success');
    } catch (e: any) { showToast(e.message || 'Save failed', 'error'); } finally { setSaving(false); showLoader(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    // When settings change from load, update app settings
    if (settings.defaultCurrency && settings.defaultTimezone) {
      setAppSettings({ currency: settings.defaultCurrency, timezone: settings.defaultTimezone });
      console.log('Settings loaded and applied:', { currency: settings.defaultCurrency, timezone: settings.defaultTimezone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.defaultCurrency, settings.defaultTimezone]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 900, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>System Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Current Theme: {mode}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                label="Theme (Immediate)" 
                value={mode} 
                onChange={(e) => {
                  const newTheme = e.target.value as 'light' | 'dark';
                  if (newTheme !== mode) {
                    toggleTheme();
                    showToast(`Theme changed to ${newTheme}`, 'info');
                  }
                }}
                helperText="Theme changes are applied immediately"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default Currency"
                value={settings.defaultCurrency}
                onChange={(e) => {
                  const currency = e.target.value as Settings['defaultCurrency'];
                  const currencyTimezoneMap: Record<Settings['defaultCurrency'], string> = {
                    INR: 'Asia/Kolkata',
                    USD: 'America/New_York',
                  };
                  setSettings({
                    ...settings,
                    defaultCurrency: currency,
                    defaultTimezone: currencyTimezoneMap[currency] || settings.defaultTimezone,
                  });
                }}
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Default Timezone" value={settings.defaultTimezone} onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />} label="Email Notifications" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />} label="Maintenance Mode" />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={save} disabled={saving}>Save Settings</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemSettingsPage;


