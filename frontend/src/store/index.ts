import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice.ts';
import categoryReducer from './slices/categorySlice';
import tagReducer from './slices/tagSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    categories: categoryReducer,
    tags: tagReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略非序列化的值
        ignoredActions: ['auth/setTokens'],
        ignoredPaths: ['auth.token', 'auth.refreshToken'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;