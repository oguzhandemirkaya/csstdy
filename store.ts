import { configureStore } from '@reduxjs/toolkit';
import collectionsReducer from './slices/collectionsSlice';
import productsReducer from './slices/productsSlice';
import filtersReducer from './slices/filtersSlice';
import pinnedProductsReducer from './slices/pinnedProductsSlice';

export const store = configureStore({
  reducer: {
    collections: collectionsReducer,
    products: productsReducer,
    filters: filtersReducer,
    pinnedProducts: pinnedProductsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 