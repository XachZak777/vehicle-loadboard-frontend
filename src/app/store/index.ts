import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import { hauliusApi } from './services/hauliusApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [hauliusApi.reducerPath]: hauliusApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hauliusApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
