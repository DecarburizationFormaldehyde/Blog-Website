import {createSlice,createAsyncThunk,type PayloadAction} from '@reduxjs/toolkit';
import type {Post,PostSimple,PostCreate,PostUpdate,Pagination} from '../../types';
import {postService} from "../../services/apis.ts";

interface PostState{
    posts: PostSimple[];
    currentPost: Post | null;
    pagination: Pagination;
    isLoading: boolean;
    error: string | null;
}

const initialState: PostState = {
    posts: [],
    currentPost: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
    },
    isLoading: false,
    error: null,
};

export const fetchPosts =createAsyncThunk(
    'posts/fetchPosts',
    async (params:{
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        category_id?: number;
        tag_id?: number;
    },{ rejectWithValue })=>{
        try{
            const response = await postService.getPosts(params);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'获取文章列表失败')
        }
    }
);

export const fetchPost =createAsyncThunk(
    'posts/fetchPost',
    async (idOrSlug: number | string,{ rejectWithValue })=>{
        try{
            const response = await postService.getPost(idOrSlug);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'获取文章失败');
        }
    }
);

export const createPost =  createAsyncThunk(
    'posts/createPost',
    async (postData: PostCreate,{ rejectWithValue })=>{
        try{
            const response = await postService.createPost(postData);
            return response;
        }catch (error:any){
            return  rejectWithValue(error.response?.data?.detail||'创建文章失败');
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async (params:{
        id: number;
        postData: PostUpdate;
    },{ rejectWithValue })=>{
        try{
            const response = await postService.updatePost(params.id,params.postData);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'更新文章失败');
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (id: number,{ rejectWithValue })=>{
        try{
            const response = await postService.deletePost(id);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'删除文章失败');
        }
    }
);

export const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
        setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
            state.pagination = {...state.pagination, ...action.payload};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchPost.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPost = action.payload;
            })
            .addCase(fetchPost.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(createPost.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
            })

            .addCase(updatePost.fulfilled, (state, action) => {
                const index = state.posts.findIndex(post => post.id === action.payload.id);
                if (index !== -1) {
                    state.posts[index] = action.payload;
                }
                if (state.currentPost && state.currentPost.id===action.payload.id){
                    state.currentPost = action.payload;
                }
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter(post => post.id !== action.payload.id);
                if (state.currentPost && state.currentPost.id===action.payload.id){
                    state.currentPost = null;
                }
            });
    },
});

export const { clearCurrentPost, setPagination } = postSlice.actions;
export default postSlice.reducer;
