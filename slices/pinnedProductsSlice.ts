import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/utils/apiService';
import { ProductItem } from './productsSlice';

interface PinnedProductsState {
  pinnedProducts: string[];
  pinnedProductsData: ProductItem[];
  isEditingPins: boolean;
  savingPins: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: PinnedProductsState = {
  pinnedProducts: [],
  pinnedProductsData: [],
  isEditingPins: false,
  savingPins: false,
  loading: false,
  error: null
};

export const fetchPinnedProducts = createAsyncThunk(
  'pinnedProducts/fetchPinnedProducts',
  async (collectionId: number, { rejectWithValue }) => {
    try {
      const response = await ApiService.getConstantProducts(collectionId);
      if (response.status === 200 && response.data) {
        return response.data.constants || [];
      }
      return rejectWithValue('Sabit ürünler yüklenemedi');
    } catch (error) {
      return rejectWithValue('Sabit ürünler yüklenirken bir hata oluştu');
    }
  }
);

export const updatePinnedProducts = createAsyncThunk(
  'pinnedProducts/updatePinnedProducts',
  async ({ collectionId, pinnedProducts }: { collectionId: number; pinnedProducts: string[] }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateConstantProducts(collectionId, pinnedProducts);
      if (response.status === 200) {
        return pinnedProducts;
      }
      return rejectWithValue('Sabit ürünler güncellenemedi');
    } catch (error) {
      return rejectWithValue('Sabit ürünler güncellenirken bir hata oluştu');
    }
  }
);

const pinnedProductsSlice = createSlice({
  name: 'pinnedProducts',
  initialState,
  reducers: {
    togglePinProduct: (state, action) => {
      const productKey = action.payload;
      const index = state.pinnedProducts.indexOf(productKey);
      if (index > -1) {
        state.pinnedProducts.splice(index, 1);
      } else {
        state.pinnedProducts.push(productKey);
      }
    },
    setIsEditingPins: (state, action) => {
      state.isEditingPins = action.payload;
    },
    updatePinnedProductsData: (state, action) => {
      state.pinnedProductsData = action.payload;
    },
    reorderPinnedProducts: (state, action) => {
      const { dragIndex, hoverIndex } = action.payload;
      const updated = [...state.pinnedProductsData];
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, removed);
      state.pinnedProductsData = updated;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPinnedProducts
      .addCase(fetchPinnedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPinnedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.pinnedProducts = action.payload;
      })
      .addCase(fetchPinnedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updatePinnedProducts
      .addCase(updatePinnedProducts.pending, (state) => {
        state.savingPins = true;
        state.error = null;
      })
      .addCase(updatePinnedProducts.fulfilled, (state, action) => {
        state.savingPins = false;
        state.pinnedProducts = action.payload;
        state.isEditingPins = false;
      })
      .addCase(updatePinnedProducts.rejected, (state, action) => {
        state.savingPins = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  togglePinProduct,
  setIsEditingPins,
  updatePinnedProductsData,
  reorderPinnedProducts
} = pinnedProductsSlice.actions;

export default pinnedProductsSlice.reducer; 