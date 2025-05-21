import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PayslipState, Payslip } from '../../types';
import { payslipAPI } from '../../services/api';

const initialState: PayslipState = {
  payslips: [],
  loading: false,
  error: null,
};

export const fetchPayslips = createAsyncThunk('payslips/fetch', async () => {
  const response = await payslipAPI.getPayslips();
  return response;
});

export const fetchPayslipById = createAsyncThunk(
  'payslips/fetchById',
  async (id: string) => {
    const response = await payslipAPI.getPayslipById(id);
    return response;
  }
);

const payslipSlice = createSlice({
  name: 'payslip',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayslips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        state.loading = false;
        state.payslips = action.payload;
      })
      .addCase(fetchPayslips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payslips';
      })
      .addCase(fetchPayslipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayslipById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payslips.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payslips[index] = action.payload;
        } else {
          state.payslips.push(action.payload);
        }
      })
      .addCase(fetchPayslipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payslip';
      });
  },
});

export default payslipSlice.reducer; 