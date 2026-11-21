import axios from 'axios';
import type {UserLogin, UserRegister, PostCreate, PostUpdate} from '../types';

const API_URL = 'http://39.96.116.136:8000/api/v1';

// 创建 axios 实例
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});

api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token')
        if (token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

// 响应拦截器：处理 token 过期
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新 token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除 token 并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// 认证服务
export const authService = {
  login: (credentials: UserLogin) =>
    api.post('/auth/login-json', credentials).then(res => res.data),

  register: (userData: UserRegister) =>
    api.post('/auth/register', userData).then(res => res.data),

  getCurrentUser: () =>
    api.get('/auth/me').then(res => res.data),

  logout: () =>
    api.post('/auth/logout').then(res => res.data),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }).then(res => res.data),

  checkAuth: () =>
    api.get('/auth/check-auth').then(res => res.data),
};

// 文章服务
export const postService = {
  getPosts: (params?: any) =>
    api.get('/posts', { params }).then(res => res.data),

  getPost: (idOrSlug: number | string) =>{
    const url=typeof idOrSlug === 'number'
        ? `/posts/${idOrSlug}`          // 通过 id
        : `/posts/slug/${idOrSlug}`;    // 通过 slug
      return api.get(url).then(res => res.data);
  },

  getPostBySlug: (slug: string) =>
    api.get(`/posts/slug/${slug}`).then(res => res.data),

  createPost: (postData: PostCreate) =>
    api.post('/posts', postData).then(res => res.data),

  updatePost: (id: number, postData: PostUpdate) =>
    api.put(`/posts/${id}`, postData).then(res => res.data),

  deletePost: (id: number) =>
    api.delete(`/posts/${id}`).then(res => {
      // 204状态码没有响应体，直接返回true表示成功
      return res.status === 204 ? true : res.data;
    }),

  getPostStats: () =>
    api.get('/stats/posts').then(res => res.data),
};

// 分类服务
export const categoryService = {
  getCategories: () =>
    api.get('/categories').then(res => res.data),
};

// 标签服务
export const tagService = {
  getTags: () =>
    api.get('/tags').then(res => res.data),
};

export default api;
