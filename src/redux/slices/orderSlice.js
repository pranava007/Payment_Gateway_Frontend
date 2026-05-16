import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrders, getMyOrders } from "../../services/api";

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async ({ role, email }, { rejectWithValue }) => {
    try {
      const response = role === 'admin' ? await getOrders() : await getMyOrders(email);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
