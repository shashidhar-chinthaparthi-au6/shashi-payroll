import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { RootState } from '../store';
import api from '../utils/api';
import { useUI } from '../contexts/ThemeContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  // Handle URL parameters for quick login
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlPassword = searchParams.get('password');
    
    if (urlEmail && urlPassword) {
      setEmail(urlEmail);
      setPassword(urlPassword);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    showLoader(true);

    try {
      const response = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      // Check if response exists and has data property
      if (!response || !response.data) {
        throw new Error('Server returned an invalid response');
      }

      const { data } = response;

      // Validate user data structure
      if (!data.user || typeof data.user !== 'object') {
        throw new Error('User data is missing or invalid');
      }

      // Validate required user fields
      const { id, name, email: userEmail, role } = data.user;
      if (!id || !name || !userEmail || !role) {
        throw new Error('User data is incomplete');
      }

      // Validate token
      if (!data.token || typeof data.token !== 'string') {
        throw new Error('Authentication token is missing or invalid');
      }

      // Validate role
      if (!['admin', 'client', 'employee'].includes(role)) {
        throw new Error('Invalid user role');
      }

      dispatch(loginSuccess(data));
      showToast('Login successful!', 'success');
      
      // Navigate based on role
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        default:
          throw new Error('Invalid user role');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      dispatch(loginFailure(errorMessage));
      showToast(errorMessage, 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding & Features */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />
        
        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Payroll Management System
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Streamline your payroll operations with our comprehensive management platform
          </Typography>
          
          {/* Features Grid */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {[
              { icon: <BusinessIcon />, title: 'Organization Management', desc: 'Manage multiple organizations' },
              { icon: <PeopleIcon />, title: 'Employee Management', desc: 'Complete employee lifecycle' },
              { icon: <WorkIcon />, title: 'Contractor Support', desc: 'Flexible contractor management' },
              { icon: <TrendingUpIcon />, title: 'Analytics & Reports', desc: 'Comprehensive insights' },
              { icon: <SecurityIcon />, title: 'Secure & Compliant', desc: 'Enterprise-grade security' },
              { icon: <SpeedIcon />, title: 'Fast & Reliable', desc: 'Optimized performance' },
            ].map((feature, index) => (
              <Grid item xs={6} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  <Box sx={{ color: 'white', mb: 1 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {feature.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 6 }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!error}
                    helperText={error && error.includes('email') ? error : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    required
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error}
                    helperText={error && error.includes('password') ? error : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Stack>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/register')}
                      sx={{
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Register here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Login; 