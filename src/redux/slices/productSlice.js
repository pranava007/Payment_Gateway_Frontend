import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts, createProduct, deleteProduct } from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProducts();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/add",
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await createProduct(productData);
      dispatch(fetchProducts());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add product");
    }
  }
);

export const removeProduct = createAsyncThunk(
  "products/remove",
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await deleteProduct(productId);
      dispatch(fetchProducts());
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
