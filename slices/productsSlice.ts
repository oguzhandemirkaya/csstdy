import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/utils/apiService';

export type ProductItem = {
  productCode: string;
  colorCode: string;
  name: string | null;
  outOfStock: boolean;
  isSaleB2B: boolean;
  imageUrl: string;
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    { collectionId, page = 1, pageSize = 36, filters = [] }: { collectionId: number; page?: number; pageSize?: number; filters?: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.getCollectionProducts(collectionId, page, pageSize, filters);
      if (response.status === 200 && response.data) {
        return {
          products: response.data.data || [],
          totalProduct: response.data.meta?.totalProduct || 0,
        };
      } else {
        return rejectWithValue('Ürünler alınamadı.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Bir hata oluştu.');
    }
  }
);

interface ProductsState {
  items: ProductItem[];
  totalProduct: number;
  loading: boolean;
  error: string;
}

const initialState: ProductsState = {
  items: [],
  totalProduct: 0,
  loading: false,
  error: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.totalProduct = action.payload.totalProduct;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productsSlice.reducer; 