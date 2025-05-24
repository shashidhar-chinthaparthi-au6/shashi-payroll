import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendanceState, Attendance } from '../../types';
import { attendanceAPI } from '../../services/api';

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
};

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.markAttendance(userId);
      return response;
    } catch (error: any) {
      console.error('Attendance error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/history',
  async () => {
    const response = await attendanceAPI.getAttendanceHistory();
    return response;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch attendance history';
      });
  },
});

export default attendanceSlice.reducer; 