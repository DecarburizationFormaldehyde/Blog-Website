import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Tag } from '../../types';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

// 异步获取标签列表
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      // 这里应该调用实际的API
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('获取标签失败');
      }
      const data = await response.json();
      return data.tags;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '未知错误');
    }
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
      state.error = null;
    },
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
    },
    removeTag: (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTags, addTag, updateTag, removeTag, setLoading, setError } = tagSlice.actions;

export default tagSlice.reducer;