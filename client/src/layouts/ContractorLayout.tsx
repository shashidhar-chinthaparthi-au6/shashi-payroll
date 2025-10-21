import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  useTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon, 
  Brightness7 as Brightness7Icon,
  Menu as MenuIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTheme } from '../contexts/ThemeContext';
import { useUI } from '../contexts/ThemeContext';

interface ContractorLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;
const collapsedDrawerWidth = 64;

const ContractorLayout: React.FC<ContractorLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useAppTheme();
  const { showToast } = useUI();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/contractor/profile');
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
    navigate('/login');
    handleClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    showToast(`Switched to ${mode === 'dark' ? 'light' : 'dark'} theme`, 'info');
    handleClose();
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
      path: '/contractor',
      badge: null,
    },
    {
      title: 'View Invoices',
      icon: <AssignmentIcon />,
      path: '/contractor/invoices',
      badge: null,
    },
    {
      title: 'Work History',
      icon: <HistoryIcon />,
      path: '/contractor/history',
      badge: null,
    },
    {
      title: 'Payment History',
      icon: <PaymentIcon />,
      path: '/contractor/payments',
      badge: null,
    },
    {
      title: 'Reports',
      icon: <AssessmentIcon />,
      path: '/contractor/reports',
      badge: null,
    },
    {
      title: 'Profile',
      icon: <PersonIcon />,
      path: '/contractor/profile',
      badge: null,
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/contractor/settings',
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
              C
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
                Contractor Portal
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                }}
              >
                Freelance Management
              </Typography>
            </>
          )}
        </Box>
      </Box>
      
      {/* Body Section */}
      <Box 
        sx={{ 
          flex: 1,
          background: mode === 'light' ? '#ffffff' : '#1a1a1a',
          borderRight: mode === 'light' 
            ? '1px solid rgba(0,0,0,0.05)' 
            : '1px solid rgba(255,255,255,0.05)',
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
                        ? 'rgba(220, 38, 38, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)'
                      : 'transparent',
                    border: isActive 
                      ? mode === 'light' 
                        ? '1px solid rgba(220, 38, 38, 0.3)' 
                        : '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: mode === 'light' 
                        ? 'rgba(220, 38, 38, 0.05)' 
                        : 'rgba(239, 68, 68, 0.05)',
                      transform: sidebarCollapsed ? 'scale(1.1)' : 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive 
                        ? mode === 'light' ? '#dc2626' : '#ef4444'
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
                              ? mode === 'light' ? '#dc2626' : '#ef4444'
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
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === location.pathname)?.title || 'Contractor Portal'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleClick} sx={{ p: 0 }}>
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  C
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile} sx={{ borderRadius: 1 }}>
                <Avatar /> Profile
              </MenuItem>
              <MenuItem onClick={handleThemeToggle} sx={{ borderRadius: 1 }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                {mode === 'dark' ? 'Light' : 'Dark'} Theme
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ borderRadius: 1 }}>
                <LogoutIcon fontSize="small" />
                <Box sx={{ ml: 1 }}>Logout</Box>
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
            right: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px + 10px)`,
            zIndex: 1300,
            display: { xs: 'none', sm: 'flex' },
            width: 40,
            height: 40,
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
            backdropFilter: 'blur(10px)',
            border: mode === 'light' 
              ? '2px solid rgba(255,255,255,0.3)'
              : '2px solid rgba(255,255,255,0.2)',
            boxShadow: mode === 'light' 
              ? '0 4px 20px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.1)'
              : '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
              transform: 'scale(1.1)',
              boxShadow: mode === 'light' 
                ? '0 6px 25px rgba(239, 68, 68, 0.4), 0 3px 12px rgba(0,0,0,0.15)'
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
          background: mode === 'light' ? '#f8fafc' : '#0a0a0a',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default ContractorLayout;
