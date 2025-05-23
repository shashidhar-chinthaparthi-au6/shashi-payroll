export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: {
    time: string;
    method: 'manual' | 'qr';
  } | null;
  checkOut: {
    time: string;
    method: 'manual' | 'qr';
  } | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  shop?: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
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