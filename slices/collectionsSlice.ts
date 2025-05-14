import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/utils/apiService';

export type Collection = {
  id: number;
  info: {
    id: number;
    name: string;
    description: string;
    url: string;
    langCode: string;
  };
  filters?: {
    useOrLogic: boolean;
    filters: {
      id: string;
      title: string;
      value: string;
      valueName?: string;
      currency?: string | null;
      comparisonType?: number;
    }[];
  };
  salesChannelId?: number;
};

export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCollections();
      if (response.data) {
        return response.data;
      } else {
        return rejectWithValue('Koleksiyonlar alınamadı.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Bir hata oluştu.');
    }
  }
);

interface CollectionsState {
  items: Collection[];
  loading: boolean;
  error: string;
}

const initialState: CollectionsState = {
  items: [],
  loading: false,
  error: '',
};

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default collectionsSlice.reducer; 