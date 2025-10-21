// Mock authentication for development/testing
export const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data based on email
  const mockUsers = {
    'admin@test.com': {
      id: '1',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+1234567890',
      organization: 'Test Organization'
    },
    'client@test.com': {
      id: '2',
      email: 'client@test.com',
      firstName: 'Client',
      lastName: 'User',
      role: 'client',
      phone: '+1234567890',
      organization: 'Test Organization'
    },
    'employee@test.com': {
      id: '3',
      email: 'employee@test.com',
      firstName: 'Employee',
      lastName: 'User',
      role: 'employee',
      phone: '+1234567890',
      organization: 'Test Organization'
    },
    'contractor@test.com': {
      id: '4',
      email: 'contractor@test.com',
      firstName: 'Contractor',
      lastName: 'User',
      role: 'contractor',
      phone: '+1234567890',
      organization: 'Test Organization'
    }
  };

  const user = mockUsers[email as keyof typeof mockUsers];
  
  if (user && password === 'password') {
    const token = `mock_token_${Date.now()}`;
    return {
      status: 200,
      data: {
        data: {
          user,
          token
        }
      },
      message: 'Login successful'
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

export const mockGetProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    status: 200,
    data: {
      data: {
        id: '1',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+1234567890',
        organization: 'Test Organization'
      }
    },
    message: 'Profile retrieved successfully'
  };
};

export const mockDashboardData = {
  admin: {
    totalUsers: 150,
    totalOrganizations: 25,
    activeContracts: 45,
    pendingApprovals: 12,
    systemHealth: 'Good',
    recentActivity: [
      { id: '1', action: 'New user registered', time: '2 hours ago', type: 'user' },
      { id: '2', action: 'Contract approved', time: '4 hours ago', type: 'contract' },
      { id: '3', action: 'System alert resolved', time: '6 hours ago', type: 'system' }
    ]
  },
  client: {
    totalEmployees: 45,
    totalContractors: 12,
    presentToday: 38,
    pendingPayroll: 3,
    pendingLeaves: 5,
    activeContracts: 8,
    monthlyPayroll: 250000,
    attendanceRate: 85
  },
  employee: {
    totalDays: 22,
    presentDays: 20,
    absentDays: 1,
    leaveDays: 1,
    todayStatus: 'not-checked-in',
    checkInTime: null,
    checkOutTime: null,
    hoursWorked: 0
  },
  contractor: {
    totalInvoices: 8,
    pendingInvoices: 2,
    totalEarnings: 45000,
    activeContracts: 3,
    attendanceRate: 90,
    recentActivity: [
      { id: '1', action: 'Invoice created', time: '1 hour ago', type: 'invoice' },
      { id: '2', action: 'Attendance marked', time: '2 hours ago', type: 'attendance' },
      { id: '3', action: 'Contract updated', time: '1 day ago', type: 'contract' }
    ]
  }
};
