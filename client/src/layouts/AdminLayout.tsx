import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Monitor as MonitorIcon,
  CheckCircle as CheckCircleIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppTheme } from '../contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useUI } from '../contexts/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import NotificationCenter from '../components/NotificationCenter';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;
const collapsedDrawerWidth = 64;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useAppTheme();
  const { showToast } = useUI();
  

  const handleToggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    toggleTheme();
    showToast(`Switched to ${newMode === 'light' ? 'Light' : 'Dark'} mode`, 'info');
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    showToast(`Sidebar ${sidebarCollapsed ? 'expanded' : 'collapsed'}`, 'info');
  };


  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      badge: null,
    },
    {
      title: 'User Management',
      icon: <PeopleIcon />,
      path: '/admin/users',
      badge: null,
    },
    {
      title: 'Organization Management',
      icon: <BusinessIcon />,
      path: '/admin/organizations',
      badge: null,
    },
    {
      title: 'Contractor Management',
      icon: <WorkIcon />,
      path: '/admin/contractors',
      badge: null,
    },
    {
      title: 'Contract Management',
      icon: <AssignmentIcon />,
      path: '/admin/contracts',
      badge: null,
    },
    {
      title: 'Pending Approvals',
      icon: <CheckCircleIcon />,
      path: '/admin/approvals',
      badge: '3',
    },
    {
      title: 'Global Analytics',
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
      badge: null,
    },
    {
      title: 'Advanced Reporting',
      icon: <AssessmentIcon />,
      path: '/admin/reports',
      badge: null,
    },
    {
      title: 'System Monitoring',
      icon: <MonitorIcon />,
      path: '/admin/monitoring',
      badge: null,
    },
    {
      title: 'System Health',
      icon: <SecurityIcon />,
      path: '/admin/health',
      badge: null,
    },
    {
      title: 'System Settings',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      badge: null,
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box
        sx={{
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          color: mode === 'light' ? '#1a1a1a' : '#ffffff',
          p: sidebarCollapsed ? 2 : 3,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          transition: 'all 0.3s ease-in-out',
        }}>
          {sidebarCollapsed ? (
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              A
            </Typography>
          ) : (
            <>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Admin Panel
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                }}
              >
                System Administration
              </Typography>
            </>
          )}
        </Box>
      </Box>
      
      {/* Body Section */}
      <Box 
        sx={{ 
          flex: 1,
          background: mode === 'light' 
            ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
          borderRight: mode === 'light' 
            ? '1px solid rgba(102, 126, 234, 0.1)' 
            : '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: mode === 'light' 
              ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.01"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5,
            pointerEvents: 'none',
          },
        }}
      >
        <List sx={{ 
          px: sidebarCollapsed ? 1 : 2, 
          py: 3,
          transition: 'all 0.3s ease-in-out',
        }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed ? item.title : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    px: sidebarCollapsed ? 1 : 2,
                    backgroundColor: isActive 
                      ? mode === 'light' 
                        ? 'rgba(102, 126, 234, 0.1)' 
                        : 'rgba(144, 202, 249, 0.1)'
                      : 'transparent',
                    border: isActive 
                      ? mode === 'light' 
                        ? '1px solid rgba(102, 126, 234, 0.3)' 
                        : '1px solid rgba(144, 202, 249, 0.3)'
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: mode === 'light' 
                        ? 'rgba(102, 126, 234, 0.05)' 
                        : 'rgba(144, 202, 249, 0.05)',
                      transform: sidebarCollapsed ? 'scale(1.1)' : 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive 
                        ? mode === 'light' ? '#667eea' : '#90caf9'
                        : mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                      minWidth: sidebarCollapsed ? 'auto' : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <>
                      <ListItemText 
                        primary={item.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            color: isActive 
                              ? mode === 'light' ? '#667eea' : '#90caf9'
                              : mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)',
                          },
                        }}
                      />
                      {item.badge && (
                        <Badge 
                          badgeContent={item.badge} 
                          color="error" 
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: '0.7rem',
                              height: 18,
                              minWidth: 18,
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
          transition: 'all 0.3s ease-in-out',
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          boxShadow: mode === 'light' 
            ? '0 8px 32px rgba(102, 126, 234, 0.15), 0 4px 16px rgba(0,0,0,0.1)'
            : '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
          borderRadius: 0,
          borderBottom: mode === 'light' 
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: mode === 'light' 
              ? 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar sx={{ 
          position: 'relative',
          zIndex: 1,
          minHeight: '64px',
          px: { xs: 2, sm: 3 },
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              fontSize: '1.25rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
            }}
          >
            {menuItems.find(item => item.path === location.pathname)?.title || 'Admin Panel'}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 0,
            px: 2,
            py: 1,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <NotificationBell onOpenNotifications={() => setNotificationsOpen(true)} />
            <Tooltip title="Open settings">
              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Avatar 
                  alt="Profile" 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      border: '2px solid rgba(255,255,255,0.6)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: mode === 'light' 
                    ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(102, 126, 234, 0.1)'
                    : '0 20px 60px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2)',
                  border: mode === 'light' 
                    ? '1px solid rgba(102, 126, 234, 0.1)'
                    : '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  background: mode === 'light' 
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(30, 41, 59, 0.95)',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: mode === 'light' 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.1) 0%, rgba(52, 69, 94, 0.1) 100%)',
                    pointerEvents: 'none',
                  },
                }
              }}
            >
              <MenuItem 
                onClick={handleToggleTheme} 
                sx={{ 
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    background: mode === 'light' 
                      ? 'rgba(102, 126, 234, 0.1)'
                      : 'rgba(144, 202, 249, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                <Box sx={{ ml: 1, fontWeight: 500 }}>{mode === 'light' ? 'Dark Mode' : 'Light Mode'}</Box>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleCloseUserMenu(); navigate('/profile'); }} 
                sx={{ 
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    background: mode === 'light' 
                      ? 'rgba(102, 126, 234, 0.1)'
                      : 'rgba(144, 202, 249, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <AccountCircleIcon fontSize="small" />
                <Box sx={{ ml: 1, fontWeight: 500 }}>Profile</Box>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleCloseUserMenu(); handleLogout(); }} 
                sx={{ 
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    background: mode === 'light' 
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(248, 113, 113, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <LogoutIcon fontSize="small" />
                <Box sx={{ ml: 1, fontWeight: 500 }}>Logout</Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
        }}
        aria-label="mailbox folders"
      >
        {/* Toggle Button - Positioned half on sidebar, half on navbar */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={handleSidebarToggle}
          sx={{ 
            position: 'fixed',
            top: 16,
            right: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px + -15px)`,
            zIndex: 1300,
            display: { xs: 'none', sm: 'flex' },
            width: 40,
            height: 40,
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            backdropFilter: 'blur(10px)',
            border: mode === 'light' 
              ? '2px solid rgba(255,255,255,0.3)'
              : '2px solid rgba(255,255,255,0.2)',
            boxShadow: mode === 'light' 
              ? '0 4px 20px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(0,0,0,0.1)'
              : '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                : 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
              transform: 'scale(1.1)',
              boxShadow: mode === 'light' 
                ? '0 6px 25px rgba(102, 126, 234, 0.4), 0 3px 12px rgba(0,0,0,0.15)'
                : '0 6px 25px rgba(0,0,0,0.5), 0 3px 12px rgba(0,0,0,0.3)',
            },
            transition: 'all 0.3s ease-in-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: mode === 'light' 
                ? 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="10" cy="10" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                : 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="10" cy="10" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
              pointerEvents: 'none',
            },
          }}
        >
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              background: 'transparent',
              borderRadius: 0,
              transition: 'all 0.3s ease-in-out',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              background: 'transparent',
              borderRight: 'none',
              borderRadius: 0,
              transition: 'all 0.3s ease-in-out',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          transition: 'all 0.3s ease-in-out',
          minHeight: '100vh',
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: mode === 'light' 
              ? 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.03"%3E%3Ccircle cx="40" cy="40" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="40" cy="40" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.6,
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <NotificationCenter 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </Box>
  );
};

export default AdminLayout; 