import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/utils/apiService';

export type Filter = {
  id: string;
  title: string;
  values: {
    value: string;
    valueName: string | null;
  }[];
  comparisonType: number;
};

export type SelectedFilter = {
  id: string;
  value: string;
  comparisonType: number;
};

interface FiltersState {
  filters: Filter[];
  selectedFilters: SelectedFilter[];
  stockFilter: string;
  productCodeFilter: string;
  sortOrder: string;
  allSizesInStock: boolean;
  minStock: string;
  maxStock: string;
  warehouseFilter: string;
  yearFilter: string;
  generalFilter: string;
  generalFilterType: string;
  appliedFilters: string[];
  loading: boolean;
  error: string | null;
}

const initialState: FiltersState = {
  filters: [],
  selectedFilters: [],
  stockFilter: "",
  productCodeFilter: "",
  sortOrder: "",
  allSizesInStock: false,
  minStock: "",
  maxStock: "",
  warehouseFilter: "",
  yearFilter: "",
  generalFilter: "",
  generalFilterType: "",
  appliedFilters: [],
  loading: false,
  error: null
};

export const fetchFilters = createAsyncThunk(
  'filters/fetchFilters',
  async (collectionId: number, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCollectionFilters(collectionId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      return rejectWithValue('Filtreler yüklenemedi');
    } catch (error) {
      return rejectWithValue('Filtreler yüklenirken bir hata oluştu');
    }
  }
);

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStockFilter: (state, action) => {
      state.stockFilter = action.payload;
    },
    setProductCodeFilter: (state, action) => {
      state.productCodeFilter = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setAllSizesInStock: (state, action) => {
      state.allSizesInStock = action.payload;
    },
    setMinStock: (state, action) => {
      state.minStock = action.payload;
    },
    setMaxStock: (state, action) => {
      state.maxStock = action.payload;
    },
    setWarehouseFilter: (state, action) => {
      state.warehouseFilter = action.payload;
    },
    setYearFilter: (state, action) => {
      state.yearFilter = action.payload;
    },
    setGeneralFilter: (state, action) => {
      state.generalFilter = action.payload;
    },
    setGeneralFilterType: (state, action) => {
      state.generalFilterType = action.payload;
    },
    addSelectedFilter: (state, action) => {
      const existingIndex = state.selectedFilters.findIndex(f => f.id === action.payload.id);
      if (existingIndex > -1) {
        state.selectedFilters[existingIndex] = action.payload;
      } else {
        state.selectedFilters.push(action.payload);
      }
    },
    removeSelectedFilter: (state, action) => {
      state.selectedFilters = state.selectedFilters.filter(f => f.id !== action.payload);
    },
    clearFilters: (state) => {
      state.stockFilter = "";
      state.productCodeFilter = "";
      state.sortOrder = "";
      state.allSizesInStock = false;
      state.minStock = "";
      state.maxStock = "";
      state.warehouseFilter = "";
      state.yearFilter = "";
      state.generalFilter = "";
      state.generalFilterType = "";
      state.selectedFilters = [];
      state.appliedFilters = [];
    },
    updateAppliedFilters: (state, action) => {
      state.appliedFilters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filters = action.payload;
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setStockFilter,
  setProductCodeFilter,
  setSortOrder,
  setAllSizesInStock,
  setMinStock,
  setMaxStock,
  setWarehouseFilter,
  setYearFilter,
  setGeneralFilter,
  setGeneralFilterType,
  addSelectedFilter,
  removeSelectedFilter,
  clearFilters,
  updateAppliedFilters
} = filtersSlice.actions;

export default filtersSlice.reducer; 