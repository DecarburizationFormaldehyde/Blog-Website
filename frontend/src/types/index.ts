export interface User{
    id: number;
    name: string;
    email: string;
    display_name?: string;
    avatar?: string;
    bio?: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
    last_login_at?: string;
}

export interface UserLogin{
    username: string;
    password: string;
}

export interface UserRegister{
    username: string;
    password: string;
    email: string;
    display_name?: string;
}

export interface AuthResponse{
    access_token: string;
    refresh_token: string;
    token_type: string;
}

// 文章相关
export interface Post{
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'private';
    featured_image?: string;
    pinned: boolean;
    allow_comments: boolean;
    author_id: number;
    category_id?: number;
    series_id?: number;
    word_count: number;
    reading_time?: number;
    created_at: string;
    updated_at?: string;
    published_at?: string;
    author?: UserSimple;
    category?: Category;
    tags?: Tag[];
}

export interface PostSimple{
    id:number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    status: string;
    created_at:string;
    pinned: boolean;
    published_at?: string;
    author?: UserSimple;
    category?: Category;
}

export interface PostCreate{
    title: string;
    content: string;
    excerpt?: string;
    status?: 'draft' | 'published' | 'archived';
    visibility?: 'public' | 'private';
    featured_image?: string;
    pinned?: boolean;
    allow_comments?: boolean;
    category_id?: number | null;
    series_id?: number | null;
    tags?: string[];
}

export interface PostUpdate{
    title?: string;
    content?: string;
    excerpt?: string;
    status?: 'draft' | 'published' | 'archived';
    visibility?: 'public' | 'private';
    featured_image?: string;
    pinned?: boolean;
    allow_comments?: boolean;
    category_id?: number | null;
    series_id?: number | null;
    tags?: string[];
}

// 分类和标签
export interface Category{
    id: number;
    name:string;
    slug:string;
    description?:string;
    post_count: number;
}

export interface Tag{
    id: number;
    name:string;
    slug:string;
    description?:string;
    post_count: number;
}

export interface UserSimple {
  id: number;
  username: string;
  display_name?: string;
  avatar?: string;
}


// APi响应
export interface ApiResponse<T = any>{
    success: boolean;
    data?: T;
    massage?: string;
    error_code:number;
}

//分页参数
export interface Pagination{
    total: number;
    page: number;
    limit: number;
    pages: number;
}

// 状态管理
export interface AuthState{
    user: User | null;
    token: string | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface PostState{
    posts: PostSimple[];
    currentPost: Post | null;
    pagination: Pagination;
    isLoading: boolean;
    error: string | null;
}

export interface CategoryState{
    categories: Category[];
    currentCategory: Category | null;
    isLoading: boolean;
}

export interface TagState{
    tags: Tag[];
    currentTag: Tag | null;
    isLoading: boolean;
}

export interface UIState{
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    isLoading: boolean;
    notification: Notification[];
}

export interface Notification{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}