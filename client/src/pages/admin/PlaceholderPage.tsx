import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Paper,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  comingSoon?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon,
  features = [],
  comingSoon = true,
}) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {icon}
          <Typography variant="h4" component="h1" fontWeight={700}>
            {title}
          </Typography>
          {comingSoon && (
            <Chip
              label="Coming Soon"
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          {description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                What to expect
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This feature is currently under development. Here's what you can expect:
              </Typography>
              
              {features.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Planned Features:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" disabled>
                  <ConstructionIcon sx={{ mr: 1 }} />
                  Under Development
                </Button>
                <Button variant="outlined" disabled>
                  <TimelineIcon sx={{ mr: 1 }} />
                  View Progress
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Development Status
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip label="In Development" color="warning" size="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Priority
                </Typography>
                <Typography variant="body2">High</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estimated Completion
                </Typography>
                <Typography variant="body2">Q1 2024</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlaceholderPage;
