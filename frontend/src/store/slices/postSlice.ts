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
        author_id?: number;
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
            console.log('发送到后端的数据:', postData);
            const response = await postService.createPost(postData);
            return response;
        }catch (error:any){
            console.error('创建文章API错误:', error);
            console.error('错误响应:', error.response?.data);
            
            // 处理不同的错误类型
            let errorMessage = '创建文章失败';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return rejectWithValue(errorMessage);
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
            await postService.deletePost(id);
            // 对于204状态码，不需要返回数据，直接返回id
            return { id };
        }catch (error:any){
            console.error('删除文章API错误:', error);
            return rejectWithValue(error.response?.data?.detail || '删除文章失败');
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
