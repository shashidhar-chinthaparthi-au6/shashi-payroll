export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  notes?: string;
  status: 'present' | 'absent' | 'leave';
}

export interface MonthlySummary {
  month: string;
  year: number;
  present: number;
  absent: number;
  leave: number;
  total: number;
}

export interface AttendanceState {
  currentStatus: 'checked-in' | 'checked-out' | 'not-checked-in';
  lastCheckIn?: string;
  lastCheckOut?: string;
} 