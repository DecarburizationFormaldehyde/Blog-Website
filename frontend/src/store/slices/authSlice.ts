import {createSlice,createAsyncThunk,type PayloadAction} from '@reduxjs/toolkit'
import type {User, UserLogin,UserRegister} from '../../types/index.ts'
import {authService} from "../../services/apis.ts";

interface AuthState {
    user:User | null,
    token:string | null,
    refreshToken:string | null,
    isAuthenticated:boolean,
    isLoading:boolean,
    error:string | null;
}

const initialState:AuthState={
    user:null,
    token:localStorage.getItem('token'),
    refreshToken:localStorage.getItem('refreshToken'),
    isAuthenticated:false,
    isLoading:false,
    error:null,
};

export const login =createAsyncThunk(
    'auth/login',
    async (credentials:UserLogin,{rejectWithValue})=> {
        try{
            const response = await authService.login(credentials);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'登录失败');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: UserRegister,{rejectWithValue})=>{
        try{
            const response = await authService.register(userData);
            return response;
        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'注册失败');
        }
}
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_,{rejectWithValue,getState})=>{
        try{
            const { auth } =getState() as { auth: AuthState };
            if (!auth.token){
                throw new Error('未找到Token');
            }
            const response = await authService.getCurrentUser();
            return response;

        }catch (error:any){
            return rejectWithValue(error.response?.data?.detail||'获取用户信息失败');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_,{rejectWithValue})=>{
        try{
            await authService.logout();
            return null;
        }catch (error:any){
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name:'auth',
    initialState:initialState,
    reducers:{
        setTokens:(state,action:PayloadAction<{token:string,refreshToken:string}>)=>{
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('token',action.payload.token);
            localStorage.setItem('refreshToken',action.payload.refreshToken);
        },
        clearTokens:(state)=>{
            state.token = null;
            state.refreshToken = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
    },
    extraReducers:(builder)=>{
        builder
            // 登录
            .addCase(login.pending,(state)=>{
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.token = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.isAuthenticated = true;
                localStorage.setItem('token',action.payload.access_token);
                localStorage.setItem('refreshToken',action.payload.refresh_token)
            })
            .addCase(login.rejected,(state,action)=>{
                state.isLoading = false;
                state.error = action.payload as string;
            })

            //  注册
            .addCase(register.pending,(state)=>{
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected,(state,action)=>{
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // 获取当前用户信息
            .addCase(getCurrentUser.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected,(state)=>{
                state.isLoading = false;
                state.isAuthenticated = false;
            })
            // 登出
            .addCase(logout.fulfilled,(state)=>{
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            });
    },
});

export const { setTokens, clearTokens, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;