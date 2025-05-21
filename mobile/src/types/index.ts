export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  shop: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employee?: Employee;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn: { time: string };
  checkOut?: { time: string };
  status: 'present' | 'absent' | 'late';
}

export interface Payslip {
  id: string;
  userId: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AttendanceState {
  records: Attendance[];
  loading: boolean;
  error: string | null;
}

export interface PayslipState {
  payslips: Payslip[];
  loading: boolean;
  error: string | null;
} 