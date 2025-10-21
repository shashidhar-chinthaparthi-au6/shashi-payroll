export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'client' | 'employee';
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  _id: string;
  name: string;
  owner: string;
  role?: 'admin' | 'client';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  hireDate: string;
  shop: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  employee: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  employeeId: string;
  shop: string;
  date: string;
  checkIn: {
    time: string;
    method: string;
  };
  checkOut?: {
    time: string;
    method: string;
  };
  status: 'present' | 'absent' | 'late';
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  employeeId: string;
  shop: string;
  month: string;
  year: string;
  basicSalary: number;
  bonuses: number;
  allowances?: Array<{ name: string; amount: number }>;
  deductions?: Array<{ name: string; amount: number }>;
  netSalary: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
} 